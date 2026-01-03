# 📷 图片识别功能使用指南

## 🎯 功能说明

图片识别功能可以让学生**拍照上传数学题目**，系统自动识别：
- 📐 **数学公式**（LaTeX 格式）
- 📝 **题目文字**
- 📊 **几何图形描述**

---

## 🚀 快速开始

### 1️⃣ 配置 API Key

在 `.env.local` 文件中添加 OpenAI API Key：

```env
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**如何获取 OpenAI API Key？**
1. 访问 https://platform.openai.com/api-keys
2. 登录账号并创建新的 API Key
3. 复制 Key 并粘贴到 `.env.local`

---

### 2️⃣ 测试功能

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **进入测验页面**
   - 访问 http://localhost:3000
   - 点击"🔥 会考练习"
   - 选择任意快速开始选项

3. **上传图片测试**
   - 在题目页面找到"📷 拍题目 / 上传图片"区域
   - 点击上传区域选择图片
   - 系统会自动识别并显示结果

---

## 🔧 API 方案选择

### 当前使用：OpenAI GPT-4 Vision ✅

**优点**：
- ✅ 已集成到项目中
- ✅ 识别准确度高
- ✅ 中文支持优秀
- ✅ 同时识别公式、文字、图形

**成本**：
- GPT-4o: $2.50 / 1M input tokens
- 每张图片约 0.001-0.005 美元

**适合场景**：生产环境，需要高准确度

---

### 备选方案 1: Google Gemini Vision

**如何启用？**

1. 在 `src/app/api/recognize-image/route.ts` 中：
   ```typescript
   // 注释掉这一行
   // const resultA = await recognizeWithOpenAI(base64Image);

   // 启用这一行
   const resultB = await recognizeWithGemini(base64Image);
   ```

2. 取消注释 `recognizeWithGemini` 函数

3. 添加环境变量：
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

**优点**：
- ✅ 免费额度大（每月 60 次/分钟）
- ✅ 速度快
- ✅ Google 产品，稳定性好

**缺点**：
- ⚠️ 数学公式识别准确度略低于 GPT-4

---

### 备选方案 2: MathPix API

**如何启用？**

1. 在 `src/app/api/recognize-image/route.ts` 中启用 `recognizeWithMathPix` 函数

2. 注册 MathPix 账号：https://mathpix.com/

3. 添加环境变量：
   ```env
   MATHPIX_APP_ID=your_app_id
   MATHPIX_APP_KEY=your_app_key
   ```

**优点**：
- ✅ **专业数学公式识别**
- ✅ LaTeX 输出最准确
- ✅ 支持手写公式

**成本**：
- 免费：1000 次/月
- 付费：$4.99/月起

**适合场景**：需要极高公式识别准确度

---

## 📊 识别结果格式

API 返回的数据格式：

```json
{
  "success": true,
  "formula": "x^2 + 2x + 1 = 0",
  "text": "解方程：x² + 2x + 1 = 0",
  "diagram": "二次函数图像，开口向上",
  "raw": "完整的原始回应"
}
```

**字段说明**：
- `formula`: LaTeX 格式的数学公式
- `text`: 识别的完整题目文字
- `diagram`: 几何图形的描述（如果有）
- `raw`: 原始识别结果（用于调试）

---

## 🐛 常见问题

### 1. 图片上传后没反应？

**检查清单**：
- [ ] 确认 `.env.local` 中有 `OPENAI_API_KEY`
- [ ] 检查浏览器控制台是否有错误
- [ ] 查看终端日志是否有 API 调用错误

**解决方法**：
```bash
# 查看 API 日志
npm run dev

# 上传图片后，查看终端输出
[Image Upload] 開始識別圖片...
[Recognize Image] 收到图片，大小: XXXX bytes
```

---

### 2. 识别结果不准确？

**优化建议**：
- 📸 使用清晰的图片（分辨率 > 800x600）
- 🖼️ 避免模糊、反光、倾斜
- ✂️ 裁剪掉无关内容，只保留题目部分
- 🔄 如果使用 OpenAI，尝试切换到 MathPix

---

### 3. API 成本太高？

**省钱方案**：

1. **使用 Gemini** (免费额度大)
2. **限制图片大小** (在前端压缩图片)
3. **添加缓存** (相同图片不重复识别)

```typescript
// 在 handleImageUpload 中添加图片压缩
const compressedFile = await compressImage(file, 0.8); // 80% 质量
```

---

### 4. 需要支持手写题目？

**推荐方案**：使用 **MathPix API**

MathPix 专门针对手写数学公式优化，识别准确度远高于通用 Vision API。

---

## 🎨 自定义识别提示词

如果需要更精准的识别，可以修改 System Prompt：

```typescript
// src/app/api/recognize-image/route.ts:71

content: `你是一个专业的数学题目识别助手。

【识别要求】
1. 优先识别数学公式（用标准 LaTeX 格式）
2. 完整提取题目文字（保持原有格式）
3. 如有图形，详细描述几何特征

【输出格式】
{
  "formula": "公式的 LaTeX 表示",
  "text": "完整题目文字",
  "diagram": "图形描述（坐标、角度、长度等）"
}

【示例】
输入：图片包含"解方程 x²+2x+1=0"
输出：{
  "formula": "x^2 + 2x + 1 = 0",
  "text": "解方程 x²+2x+1=0",
  "diagram": ""
}`
```

---

## 📈 性能优化建议

### 1. 前端图片压缩

```bash
npm install browser-image-compression
```

```typescript
import imageCompression from 'browser-image-compression';

const handleImageUpload = async (e) => {
  const file = e.target.files[0];

  // 压缩图片
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true
  };

  const compressedFile = await imageCompression(file, options);

  // 继续上传...
};
```

### 2. 添加加载动画

在识别过程中显示加载状态，提升用户体验。

### 3. 结果缓存

将识别结果缓存到数据库，避免重复识别相同图片。

---

## 🔐 安全建议

1. **API Key 保护**
   - ✅ 永远不要在前端暴露 API Key
   - ✅ 使用环境变量存储
   - ✅ 不要提交 `.env.local` 到 Git

2. **图片大小限制**
   ```typescript
   // 在 API 中添加大小检查
   if (imageFile.size > 5 * 1024 * 1024) { // 5MB
     return NextResponse.json({ error: '图片太大' });
   }
   ```

3. **频率限制**
   ```typescript
   // 使用 Redis 或内存缓存限制请求频率
   // 例如：每个用户每分钟最多 10 次识别
   ```

---

## 📞 技术支持

**遇到问题？**

1. 查看浏览器控制台错误
2. 查看服务器终端日志
3. 检查 API Key 是否有效
4. 确认 OpenAI 账户余额

**调试技巧**：
```bash
# 启用详细日志
console.log('[Image Upload] 識別結果:', data);
console.log('[Recognize Image] 收到图片，大小:', imageFile.size);
```

---

## ✅ 测试检查清单

- [ ] 图片可以成功上传
- [ ] 识别结果正确显示
- [ ] LaTeX 公式格式正确
- [ ] 中文文字识别准确
- [ ] 错误提示清晰友好
- [ ] 加载状态正常显示
- [ ] 移除图片功能正常

---

## 🎯 下一步优化方向

1. **添加图片裁剪工具** - 让用户可以框选题目区域
2. **支持批量识别** - 一次上传多张图片
3. **识别历史记录** - 保存识别结果供复习
4. **公式编辑器** - 识别后可手动修正
5. **OCR 结果确认** - 让用户确认识别结果

---

祝使用愉快！🎉
