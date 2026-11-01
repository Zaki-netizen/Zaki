const express = require("express");
const OpenAI = require("openai");
const path = require("path");
const app = express();

app.use(express.json({ limit: "20mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze", async (req, res) => {
  try {
    const image = req.body.image;

    const response = await openai.responses.create({
      model: "gpt-6-astra",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `حلل صورة تشكيلة كرة القدم هذه.
أعطني الإجابة باللغة العربية وبشكل واضح، وتشمل:
1. الخطة المقترحة
2. أسلوب اللعب المناسب
3. نقاط القوة
4. نقاط تحتاج إلى تحسين`,
            },
            {
              type: "input_image",
              image_url: image,
              detail: "auto",
            },
          ],
        },
      ],
    });

    res.json({
      result: response.output_text,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "حدث خطأ أثناء تحليل التشكيلة",
    });
  }
});
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});
app.listen(3000, () => {
  console.log("الخادم يعمل!");
});
