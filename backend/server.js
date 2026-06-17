require('dotenv').config()
const express=require('express');
const app=express();
const corsSetup=require('./hooks/cors')
const passport=require('./hooks/google');
const upload = require('./hooks/upload');
const authRoutes = require('./routes/authRoutes');
const sessionConfig = require('./hooks/sessionConfig');
const Audios=require('./model/audios')
const Images=require('./model/images')
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const s3 = require('./hooks/s3'); 
const Videos=require('./model/videos');
const User=require('./model/user')





app.use(express.json());
app.use(corsSetup);
app.use(sessionConfig);
app.use(passport.initialize());
app.use(passport.session());



app.use('/', authRoutes);


app.post('/meme/add/data', upload.single('file'), async (req, res) => {
  try {
    const { caption, tags, fileName } = req.body;
    if (!req.file) {return res.status(400).json({success: false,msg: "No file uploaded"})}
    const key = req.file.key; // ✅ IMPORTANT
    const url = req.file.location; // optional
    const fileType = req.file.mimetype;
    const fileExt = req.file.originalname.split('.').pop();
    if (!caption || !url) {return res.status(400).json({ success: false,msg: "Empty fields"})}

  

    let parsedTags = [];
    try {
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch (err) {
      parsedTags = [];
    }

    const allowed = ['image/', 'video/', 'audio/'];
    if (!allowed.some(prefix => fileType.startsWith(prefix))) {return res.status(400).json({success: false,msg: "Only image, video, or audio files allowed"})}

    let Model;
    let type;

    if (fileType.startsWith('image/')) {
      Model = Images;
      type = "image";
    } else if (fileType.startsWith('video/')) {
      Model = Videos;
      type = "video";
    } else {
      Model = Audios;
      type = "audio";
    }
    if(!req?.user?._id) return res.json({failure:true,msg:"Login Pls"})

    const data = await Model.create({url,key,fileExt,caption,fileName,tags: parsedTags,owner:req?.user?._id});

    res.status(201).json({success: true,msg: `${type} uploaded successfully`, data });

  } catch (err) {
    res.status(500).json({success: false,error: err.message});
    console.error(err);
  }
});


app.post('/meme/get/images',async(req,res)=>{
  const {imagePage}=req.body
  const limit=10
  const skip=(imagePage-1)*limit
  const images=await Images.find({}).skip(skip).limit(limit).populate('owner')
  res.json(images)
})


app.post('/meme/get/videos', async (req, res) => {
  const {videoPage}=req.body
  const limit=10
  const skip=(videoPage-1)*limit
  const videos = await Videos.find({}).skip(skip).limit(limit).populate('owner')
  res.json(videos)
})

app.post('/meme/get/audios', async (req, res) => {
   const {audioPage}=req.body
   const limit=10
   const skip=(audioPage-1)*limit
  const audios = await Audios.find({}).skip(skip).limit(limit).populate('owner')
  res.json(audios)
})


app.get('/meme/download', async (req, res) => {
  try {
    const { key, fileName, fileExt, contentId, contentType } = req.query;

    if (!key) {
      return res.status(400).json({ error: "Missing key" });
    }

    const ext = fileExt || key.split('.').pop();
    const fullName = `${fileName || 'file'}.${ext}`;
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${fullName}"`,
    });

    const signedUrl = await getSignedUrl(s3, command, {
      expiresIn: 60,
    });

    res.json({ 
      url: signedUrl,
      contentId,
      contentType 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate download URL" });
  }
});



app.post('/meme/search', async (req, res) => {
  try {
    const { query, type = 'all', page = 1, limit = 20 } = req.body;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: "Search query is required" });
    }
    
    const searchTerm = query.trim();
    const skip = (page - 1) * limit;
    
    // Create search condition for case-insensitive search
    const searchCondition = {
      $or: [
        { caption: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { fileName: { $regex: searchTerm, $options: 'i' } }
      ]
    };
    
    let results = [];
    let total = 0;
    
    if (type === 'all') {
      // Search across all collections
      const [images, videos, audios] = await Promise.all([
        Images.find(searchCondition).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Videos.find(searchCondition).skip(skip).limit(limit).sort({ createdAt: -1 }),
        Audios.find(searchCondition).skip(skip).limit(limit).sort({ createdAt: -1 })
      ]);
      
      results = [
        ...images.map(item => ({ ...item.toObject(), contentType: 'image' })),
        ...videos.map(item => ({ ...item.toObject(), contentType: 'video' })),
        ...audios.map(item => ({ ...item.toObject(), contentType: 'audio' }))
      ];
      
      total = results.length;
    } else {
      // Search specific content type
      let Model;
      let contentType;
      
      switch(type) {
        case 'image':
          Model = Images;
          contentType = 'image';
          break;
        case 'video':
          Model = Videos;
          contentType = 'video';
          break;
        case 'audio':
          Model = Audios;
          contentType = 'audio';
          break;
        default:
          return res.status(400).json({ error: "Invalid content type" });
      }
      
      const items = await Model.find(searchCondition)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      total = await Model.countDocuments(searchCondition);
      results = items.map(item => ({ ...item.toObject(), contentType }));
    }
    
    res.json({
      success: true,
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      query: searchTerm,
      type
    });
    
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});



app.post('/meme/search/suggestions', async (req, res) => {
  try {
    const { query, limit = 5 } = req.body;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: { captions: [], tags: [] } });
    }
    
    const searchRegex = new RegExp(query, 'i');
    
    // Get caption suggestions
    const [imageCaptions, videoCaptions, audioCaptions] = await Promise.all([
      Images.find({ caption: searchRegex }).limit(limit).select('caption'),
      Videos.find({ caption: searchRegex }).limit(limit).select('caption'),
      Audios.find({ caption: searchRegex }).limit(limit).select('caption')
    ]);
    
    // Get tag suggestions
    const [imageTags, videoTags, audioTags] = await Promise.all([
      Images.aggregate([
        { $unwind: "$tags" },
        { $match: { tags: searchRegex } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]),
      Videos.aggregate([
        { $unwind: "$tags" },
        { $match: { tags: searchRegex } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]),
      Audios.aggregate([
        { $unwind: "$tags" },
        { $match: { tags: searchRegex } },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ])
    ]);
    
    // Extract unique captions
    const captions = [...new Set(
      [...imageCaptions, ...videoCaptions, ...audioCaptions]
        .map(item => item.caption)
        .filter(Boolean)
    )];
    
    // Extract unique tags
    const tags = [...new Set(
      [...imageTags, ...videoTags, ...audioTags]
        .map(item => item._id)
        .filter(Boolean)
    )];
    
    res.json({
      suggestions: {
        captions: captions.slice(0, limit),
        tags: tags.slice(0, limit)
      }
    });
    
  } catch (err) {
    console.error('Search suggestions error:', err);
    res.status(500).json({ error: "Failed to get suggestions" });
  }
});



app.get('/meme/trending/tags', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const [imageTags, videoTags, audioTags] = await Promise.all([
      Images.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]),
      Videos.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ]),
      Audios.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: limit }
      ])
    ]);
    
    // Combine and count all tags
    const tagMap = new Map();
    
    [...imageTags, ...videoTags, ...audioTags].forEach(tag => {
      if (tagMap.has(tag._id)) {
        tagMap.set(tag._id, tagMap.get(tag._id) + tag.count);
      } else {
        tagMap.set(tag._id, tag.count);
      }
    });
    
    const trendingTags = Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    res.json({ success: true, tags: trendingTags });
    
  } catch (err) {
    console.error('Trending tags error:', err);
    res.status(500).json({ error: "Failed to fetch trending tags" });
  }
});




app.get('/meme/stats', async (req, res) => {
  try {
    const [images, videos, audios] = await Promise.all([
      Images.countDocuments(),
      Videos.countDocuments(),
      Audios.countDocuments(),
    ]);

    res.json({
      images,
      videos,
      audios,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get('/get-profile', async (req, res) => {
  try {
    const currentUser = req.user?._id
    const { page = 1, limit = 20, type = 'all', sort = 'newest' } = req.query
    
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const sortOrder = sort === 'newest' ? -1 : 1
    
    let images = [], videos = [], audios = []
    let totalImages = 0, totalVideos = 0, totalAudios = 0
    
    // Get counts for stats
    const [imageCount, videoCount, audioCount] = await Promise.all([
      Images.countDocuments({ owner: currentUser }),
      Videos.countDocuments({ owner: currentUser }),
      Audios.countDocuments({ owner: currentUser })
    ])
    
    // Fetch content based on type
    if (type === 'all' || type === 'image') {
      images = await Images.find({ owner: currentUser })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('owner')
      totalImages = imageCount
    }
    
    if (type === 'all' || type === 'video') {
      videos = await Videos.find({ owner: currentUser })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('owner')
      totalVideos = videoCount
    }
    
    if (type === 'all' || type === 'audio') {
      audios = await Audios.find({ owner: currentUser })
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('owner')
      totalAudios = audioCount
    }
    
    // Combine content with type
    let allContent = [
      ...images.map(item => ({ ...item.toObject(), type: 'image' })),
      ...videos.map(item => ({ ...item.toObject(), type: 'video' })),
      ...audios.map(item => ({ ...item.toObject(), type: 'audio' }))
    ]
    
    // Sort combined content if needed
    if (type === 'all') {
      allContent.sort((a, b) => {
        if (sort === 'newest') {
          return new Date(b.createdAt) - new Date(a.createdAt)
        } else {
          return new Date(a.createdAt) - new Date(b.createdAt)
        }
      })
      
      // Apply pagination to combined results
      const start = skip
      const end = start + parseInt(limit)
      allContent = allContent.slice(start, end)
    }
    
    res.json({
      content: allContent,
      total: type === 'all' 
        ? totalImages + totalVideos + totalAudios 
        : (type === 'image' ? totalImages : type === 'video' ? totalVideos : totalAudios),
      page: parseInt(page),
      limit: parseInt(limit),
      stats: {
        images: imageCount,
        videos: videoCount,
        audios: audioCount
      }
    })
    
  } catch (err) {
    console.error('Error fetching profile:', err)
    res.status(500).json({ error: "Failed to fetch profile data" })
  }
})

// Route to increment download count
app.post('/meme/increment-download', async (req, res) => {
  try {
    const { contentType, contentId } = req.body;
    
    if (!contentType || !contentId) {
      return res.status(400).json({ error: "Missing contentType or contentId" });
    }
    
    let Model;
    switch(contentType) {
      case 'image':
        Model = Images;
        break;
      case 'video':
        Model = Videos;
        break;
      case 'audio':
        Model = Audios;
        break;
      default:
        return res.status(400).json({ error: "Invalid content type" });
    }
    
    const updated = await Model.findByIdAndUpdate(
      contentId,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Content not found" });
    }
    
    res.json({ success: true, downloadCount: updated.downloadCount });
    
  } catch (err) {
    console.error('Error incrementing download count:', err);
    res.status(500).json({ error: "Failed to update download count" });
  }
});

app.put('/update-profile',async(req,res)=>{
 const {fullName,bio,phoneNumber,location}=req.body

 console.log(fullName,bio,phoneNumber,location)

 if(!req.user){
  return res.status(401).json({error:'User not logged in'})
 }

 console.log(req.user._id)

 try{
  const updatedUser=await User.findByIdAndUpdate(
   req.user._id,
   {fullName,bio,phoneNumber,location},
   {new:true}
  )

  res.status(200).json({message:'Updated',user:updatedUser})
 }catch(err){
  console.log(err)
  res.status(500).json({error:err.message})
 }
})

app.listen(process.env.PORT,()=>{
  console.log('Server Running');
})