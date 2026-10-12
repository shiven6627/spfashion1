
const router = require("express").Router();
const { protect, adminOnly } = require("../middleware/auth");

router.post(
  "/product-image",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const token = process.env.HF_TOKEN;
      const model =
        process.env.HF_IMAGE_MODEL ||
        "black-forest-labs/FLUX.1-schnell";

      if (!token) {
        return res.status(503).json({
          message: "Missing HF_TOKEN in server/.env",
        });
      }

      const prompt = String(req.body.prompt || "").trim();

      if (!prompt) {
        return res.status(400).json({
          message: "Describe the product image you want.",
        });
      }

      if (prompt.length > 1200) {
        return res.status(400).json({
          message: "Prompt must be under 1200 characters.",
        });
      }

      // Load the Hugging Face SDK in your CommonJS backend
      const { InferenceClient } = await import(
        "@huggingface/inference"
      );

      const client = new InferenceClient(token);

      const imageBlob = await client.textToImage({
        model,
        inputs: `Create a polished e-commerce fashion product photograph.
No text, watermark, logo, or collage.
Realistic fabric, accurate colors, clean studio lighting,
professional product photography, premium background.

Product details: ${prompt}`,
      });

      const buffer = Buffer.from(
        await imageBlob.arrayBuffer()
      );

      if (!buffer.length) {
        return res.status(502).json({
          message: "Hugging Face returned an empty image.",
        });
      }

      const mimeType = imageBlob.type || "image/png";

      const imageUrl =
        `data:${mimeType};base64,${buffer.toString("base64")}`;

      return res.json({ imageUrl });
    } catch (error) {
      console.error(
        "Hugging Face image generation error:",
        error
      );

      const message =
        error.message || "Image generation failed.";

      if (
        /credit|payment|billing|quota|rate.?limit/i.test(message)
      ) {
        return res.status(402).json({
          message:
            "Hugging Face credits or usage limits may have been reached. Check your account and model provider.",
        });
      }

      return res.status(502).json({
        message,
      });
    }
  }
);

module.exports = router;
