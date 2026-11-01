
const express = require("express");
const path = require("path");

const app = express();

app.use(express.json({ limit: "20mb" }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/analyze", async (req, res) => {
  try {
    const image = req.body.image;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "مفتاح Gemini غير موجود في Render"
      });
    }

    if (!image) {
      return res.status(400).json({
        error: "لم يتم إرسال صورة"
      });
    }

    const match = image.match(
      /^data:(image\/(?:png|jpeg|webp|heic|heif));base64,([A-Za-z0-9+/=]+)$/
    );

    if (!match) {
      return res.status(400).json({
        error: "صيغة الصورة غير مدعومة"
      });
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `أنت محلل كرة قدم محترف.
حلل صورة التشكيلة باللغة العربية.
أعطني:
1. الخطة المقترحة.
2. أسلوب اللعب المناسب.
3. نقاط القوة.
4. نقاط الضعف.
5. أفضل التغييرات التكتيكية.
كن واضحاً ودقيقاً ولا تخترع أسماء لاعبين غير ظاهرة.`
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini error:", data);
      return res.status(502).json({
        error: data.error?.message || "تعذر تحليل الصورة"
      });
    }

    const result = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n");

    if (!result) {
      return res.status(502).json({
        error: "لم يتمكن الذكاء الاصطناعي من تقديم تحليل"
      });
    }

    res.json({ result });

  } catch (error) {
    console.error("Analysis error:", error.message);

    res.status(500).json({
      error: "حدث خطأ أثناء تحليل التشكيلة"
    });
  }
});
app.post("/develop", async (req, res) => {
  try {
    const image = req.body.image;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "مفتاح Gemini غير موجود"
      });
    }

    if (!image) {
      return res.status(400).json({
        error: "لم يتم إرسال صورة اللاعب"
      });
    }

    const match = image.match(
      /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/
    );

    if (!match) {
      return res.status(400).json({
        error: "صيغة الصورة غير مدعومة"
      });
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `أنت خبير في تطوير اللاعبين في لعبة eFootball 2026.

حلل صورة اللاعب، ثم أعطني باللغة العربية:
1. اسم اللاعب إذا كان ظاهرًا.
2. مركز اللاعب.
3. نقاط القوة والضعف.
4. أفضل توزيع مقترح لنقاط التطوير.
5. أفضل أسلوب لعب يناسبه.
6. أفضل مركز يمكن أن يلعب فيه.
7. سبب اختيار هذه التطويرة.

انتبه:
- لا تخترع إحصائيات غير ظاهرة.
- إذا لم تظهر معلومات كافية، اطلب صورة أوضح.
- اجعل اقتراحاتك مناسبة لخصائص اللاعب.
- لا تدّعِ أن التوزيع مضمون أو مثالي دون معرفة تفاصيل البطاقة ومستوى اللاعب.`
              },
              {
                inlineData: {
                  mimeType: match[1],
                  data: match[2]
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini develop error:", data);
      return res.status(502).json({
        error: "تعذر تحليل اللاعب"
      });
    }

    const result = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("\n");

    if (!result) {
      return res.status(502).json({
        error: "لم يصل تحليل اللاعب"
      });
    }

    res.json({ result });

  } catch (error) {
    console.error("Develop error:", error.message);

    res.status(500).json({
      error: "حدث خطأ أثناء تطوير اللاعب"
    });
  }
});
app.listen(process.env.PORT || 3000, () => {
  console.log("EVLADOR يعمل بنجاح!");
});
