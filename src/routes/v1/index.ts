/**Node Module */
import { Router } from "express";
const router = Router();

/** Routes */
import authRoutes from "@/routes/v1/auth";
import userRoutes from "@/routes/v1/user";
import blogRoutes from "@/routes/v1/blog";

/**Root route */
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Hello World, API is live",
    status: "ok",
    version: "1.0.0",
    timeStamp: new Date().toString(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/blogs", blogRoutes);

export default router;
