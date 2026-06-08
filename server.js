import express from "express";
import cors from "cors";
import { v4 as uuid } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

let videos = [
  {
    id: uuid(),
    title: "How to Grow on YouTube in 2026",
    description: "Complete creator growth guide.",
    status: "Published",
    views: 15420,
    likes: 920,
    comments: 88,
    thumbnail: "https://picsum.photos/seed/video1/400/220",
    createdAt: "2026-06-01"
  },
  {
    id: uuid(),
    title: "Best Editing Apps for Beginners",
    description: "Simple editing apps for creators.",
    status: "Draft",
    views: 2340,
    likes: 180,
    comments: 12,
    thumbnail: "https://picsum.photos/seed/video2/400/220",
    createdAt: "2026-06-03"
  }
];

let planner = [
  { id: uuid(), title: "Record Shorts batch", date: "2026-06-10", status: "Pending" },
  { id: uuid(), title: "Create gaming thumbnail", date: "2026-06-12", status: "Pending" }
];

let earnings = [
  { id: uuid(), source: "Ads", amount: 120, date: "2026-06-01" },
  { id: uuid(), source: "Sponsorship", amount: 500, date: "2026-06-04" }
];

app.post("/api/login", (req, res) => {
  const { email } = req.body;
  res.json({
    token: "mock-token",
    user: { name: "Creator", email: email || "creator@example.com" }
  });
});

app.get("/api/dashboard", (req, res) => {
  const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0);
  const totalComments = videos.reduce((sum, v) => sum + v.comments, 0);
  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);

  res.json({
    subscribers: 12850,
    watchTime: "3.8K hours",
    totalViews,
    totalLikes,
    totalComments,
    totalEarnings,
    chart: [
      { day: "Mon", views: 1200 },
      { day: "Tue", views: 1800 },
      { day: "Wed", views: 1600 },
      { day: "Thu", views: 2200 },
      { day: "Fri", views: 3100 },
      { day: "Sat", views: 4200 },
      { day: "Sun", views: 3900 }
    ]
  });
});

app.get("/api/videos", (req, res) => res.json(videos));

app.post("/api/videos", (req, res) => {
  const video = {
    id: uuid(),
    title: req.body.title,
    description: req.body.description || "",
    status: req.body.status || "Draft",
    views: 0,
    likes: 0,
    comments: 0,
    thumbnail: req.body.thumbnail || "https://picsum.photos/seed/newvideo/400/220",
    createdAt: new Date().toISOString().slice(0, 10)
  };
  videos.unshift(video);
  res.status(201).json(video);
});

app.put("/api/videos/:id", (req, res) => {
  videos = videos.map(v => v.id === req.params.id ? { ...v, ...req.body } : v);
  res.json({ success: true });
});

app.delete("/api/videos/:id", (req, res) => {
  videos = videos.filter(v => v.id !== req.params.id);
  res.json({ success: true });
});

app.post("/api/ai/title", (req, res) => {
  const topic = req.body.topic || "Your Video";
  res.json({
    titles: [
      `${topic}: Complete Guide for Beginners`,
      `I Tried ${topic} for 7 Days`,
      `Top 10 ${topic} Tips That Actually Work`,
      `${topic} Secrets Nobody Tells You`,
      `How to Master ${topic} Fast`
    ]
  });
});

app.post("/api/ai/description", (req, res) => {
  const topic = req.body.topic || "this video";
  res.json({
    description: `In this video, we explore ${topic} in a simple and practical way. Watch till the end for tips, examples, and creator-friendly advice.\n\nLike, share, and subscribe for more videos.`
  });
});

app.get("/api/planner", (req, res) => res.json(planner));

app.post("/api/planner", (req, res) => {
  const item = { id: uuid(), title: req.body.title, date: req.body.date, status: "Pending" };
  planner.unshift(item);
  res.status(201).json(item);
});

app.delete("/api/planner/:id", (req, res) => {
  planner = planner.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

app.get("/api/earnings", (req, res) => res.json(earnings));

app.post("/api/earnings", (req, res) => {
  const item = { id: uuid(), source: req.body.source, amount: Number(req.body.amount), date: req.body.date };
  earnings.unshift(item);
  res.status(201).json(item);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
