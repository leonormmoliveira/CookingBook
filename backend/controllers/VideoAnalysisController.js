const pool = require('../config/database');

const VideoAnalysisController = {
  extrairVideo: async (req, res) => {
    try {
      const { videoUrl, userId } = req.body;
      if (!videoUrl) {
        return res.status(400).json({
          success: false,
          message: "URL do vídeo é obrigatório",
        });
      }

      // pasta onde vais guardar vídeos
      const outputDir = path.join(__dirname, "../uploads/videos");
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const fileName = `video_${Date.now()}.mp4`;
      const outputPath = path.join(outputDir, fileName);

      // comando yt-dlp
      const command = `yt-dlp -f mp4 -o "${outputPath}" "${videoUrl}"`;
      exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error("Erro yt-dlp:", error);
          return res.status(500).json({
            success: false,
            message: "Erro ao fazer download do vídeo",
          });
        }

        console.log("Download concluído:", outputPath);

        // aqui já tens o vídeo pronto
        return res.json({
          success: true,
          message: "Vídeo descarregado com sucesso",
          videoPath: outputPath,
        });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Erro interno no servidor",
      });
    }
  }
};

module.exports = VideoAnalysisController;
