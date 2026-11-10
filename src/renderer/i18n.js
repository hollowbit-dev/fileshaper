// Interface translation. The app is written in English; this layer translates what's on screen
// as it renders (text, placeholders, titles), so the rest of the code stays simple.
// Columns: English (key), Español, Français, Deutsch, Русский, 中文.

export const LANGS = { en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch', ru: 'Русский', zh: '中文' };
const ORDER = ['es', 'fr', 'de', 'ru', 'zh'];

const T = [
  // Navigation and shell
  ['Home', 'Inicio', 'Accueil', 'Start', 'Главная', '主页'],
  ['Tools', 'Herramientas', 'Outils', 'Werkzeuge', 'Инструменты', '工具'],
  ['Video', 'Vídeo', 'Vidéo', 'Video', 'Видео', '视频'],
  ['Images', 'Imágenes', 'Images', 'Bilder', 'Изображения', '图片'],
  ['Audio', 'Audio', 'Audio', 'Audio', 'Аудио', '音频'],
  ['History', 'Historial', 'Historique', 'Verlauf', 'История', '历史'],
  ['Settings', 'Ajustes', 'Réglages', 'Einstellungen', 'Настройки', '设置'],
  ['Support Filesmith', 'Apoyar Filesmith', 'Soutenir Filesmith', 'Filesmith unterstützen', 'Поддержать Filesmith', '支持 Filesmith'],
  ['Offline. Nothing is uploaded.', 'Sin conexión. No se sube nada.', 'Hors ligne. Rien n\'est envoyé.', 'Offline. Nichts wird hochgeladen.', 'Офлайн. Ничего не загружается.', '离线运行，不上传任何内容。'],
  ['Search actions', 'Buscar acciones', 'Rechercher une action', 'Aktionen suchen', 'Поиск действий', '搜索操作'],
  ['Drop to open in Filesmith', 'Suelta para abrir en Filesmith', 'Déposez pour ouvrir dans Filesmith', 'Ablegen, um in Filesmith zu öffnen', 'Отпустите, чтобы открыть в Filesmith', '松开即可在 Filesmith 中打开'],
  ['Video, images, PDF or audio', 'Vídeo, imágenes, PDF o audio', 'Vidéo, images, PDF ou audio', 'Video, Bilder, PDF oder Audio', 'Видео, изображения, PDF или аудио', '视频、图片、PDF 或音频'],

  // Home and command bar
  ['What do you want to do?', '¿Qué quieres hacer?', 'Que voulez-vous faire ?', 'Was möchtest du tun?', 'Что вы хотите сделать?', '你想做什么？'],
  ['Compress a video, convert a photo, sign a PDF…', 'Comprime un vídeo, convierte una foto, firma un PDF…', 'Compresser une vidéo, convertir une photo, signer un PDF…', 'Video komprimieren, Foto umwandeln, PDF unterschreiben…', 'Сжать видео, конвертировать фото, подписать PDF…', '压缩视频、转换照片、签署 PDF…'],
  ['Or drop files anywhere in the window.', 'O suelta archivos en cualquier parte de la ventana.', 'Ou déposez des fichiers n\'importe où dans la fenêtre.', 'Oder Dateien irgendwo ins Fenster ziehen.', 'Или перетащите файлы в любое место окна.', '或者把文件拖到窗口任意位置。'],
  ['Choose files…', 'Elegir archivos…', 'Choisir des fichiers…', 'Dateien wählen…', 'Выбрать файлы…', '选择文件…'],
  ['Recent', 'Recientes', 'Récents', 'Zuletzt', 'Недавние', '最近'],
  ['Files you make show up here, with how much space each one saved.', 'Aquí aparecen los archivos que crees, con el espacio que ahorró cada uno.', 'Les fichiers créés apparaissent ici, avec l\'espace gagné pour chacun.', 'Erstellte Dateien erscheinen hier, mit der jeweils gesparten Größe.', 'Здесь появятся созданные файлы и сколько места сэкономил каждый.', '你生成的文件会显示在这里，并标明各自节省了多少空间。'],
  ['No match. Try "compress", "jpg", "sign" or "gif".', 'Sin resultados. Prueba «comprimir», «jpg», «firmar» o «gif».', 'Aucun résultat. Essayez « compresser », « jpg », « signer » ou « gif ».', 'Kein Treffer. Versuch „komprimieren“, „jpg“, „unterschreiben“ oder „gif“.', 'Ничего не найдено. Попробуйте «сжать», «jpg», «подписать» или «gif».', '没有匹配项。试试“压缩”“jpg”“签署”或“gif”。'],
  ['choose', 'elegir', 'choisir', 'wählen', 'выбрать', '选择'],
  ['open', 'abrir', 'ouvrir', 'öffnen', 'открыть', '打开'],
  ['close', 'cerrar', 'fermer', 'schließen', 'закрыть', '关闭'],
  ['just now', 'ahora mismo', 'à l\'instant', 'gerade eben', 'только что', '刚刚'],
  ['Ctrl K', 'Ctrl K', 'Ctrl K', 'Strg K', 'Ctrl K', 'Ctrl K'],

  // Commands
  ['Compress a video for Discord', 'Comprimir un vídeo para Discord', 'Compresser une vidéo pour Discord', 'Video für Discord komprimieren', 'Сжать видео для Discord', '为 Discord 压缩视频'],
  ['Compress a video for email', 'Comprimir un vídeo para email', 'Compresser une vidéo pour un e-mail', 'Video für E-Mail komprimieren', 'Сжать видео для почты', '为邮件压缩视频'],
  ['Compress a video for WhatsApp', 'Comprimir un vídeo para WhatsApp', 'Compresser une vidéo pour WhatsApp', 'Video für WhatsApp komprimieren', 'Сжать видео для WhatsApp', '为 WhatsApp 压缩视频'],
  ['Convert iPhone photos to JPG', 'Convertir fotos de iPhone a JPG', 'Convertir des photos d\'iPhone en JPG', 'iPhone-Fotos in JPG umwandeln', 'Конвертировать фото iPhone в JPG', '把 iPhone 照片转成 JPG'],
  ['Sign a PDF', 'Firmar un PDF', 'Signer un PDF', 'PDF unterschreiben', 'Подписать PDF', '签署 PDF'],
  ['Merge PDFs', 'Unir PDF', 'Fusionner des PDF', 'PDFs zusammenführen', 'Объединить PDF', '合并 PDF'],
  ['Trim a video', 'Recortar un vídeo', 'Couper une vidéo', 'Video zuschneiden', 'Обрезать видео', '剪辑视频'],
  ['Make a GIF from a video', 'Crear un GIF de un vídeo', 'Créer un GIF à partir d\'une vidéo', 'GIF aus Video erstellen', 'Сделать GIF из видео', '用视频制作 GIF'],
  ['Extract audio from a video', 'Extraer el audio de un vídeo', 'Extraire l\'audio d\'une vidéo', 'Audio aus Video extrahieren', 'Извлечь звук из видео', '从视频提取音频'],
  ['Convert a video to MP4', 'Convertir un vídeo a MP4', 'Convertir une vidéo en MP4', 'Video in MP4 umwandeln', 'Конвертировать видео в MP4', '把视频转换为 MP4'],
  ['Remove sound from a video', 'Quitar el sonido de un vídeo', 'Supprimer le son d\'une vidéo', 'Ton aus Video entfernen', 'Убрать звук из видео', '去除视频的声音'],
  ['Resize images', 'Redimensionar imágenes', 'Redimensionner des images', 'Bildgröße ändern', 'Изменить размер изображений', '调整图片尺寸'],
  ['Compress images', 'Comprimir imágenes', 'Compresser des images', 'Bilder komprimieren', 'Сжать изображения', '压缩图片'],
  ['Convert images', 'Convertir imágenes', 'Convertir des images', 'Bilder umwandeln', 'Конвертировать изображения', '转换图片'],
  ['Turn images into a PDF', 'Convertir imágenes en un PDF', 'Transformer des images en PDF', 'Bilder in ein PDF umwandeln', 'Превратить изображения в PDF', '把图片做成 PDF'],
  ['Split a PDF', 'Dividir un PDF', 'Diviser un PDF', 'PDF teilen', 'Разделить PDF', '拆分 PDF'],
  ['Compress a PDF', 'Comprimir un PDF', 'Compresser un PDF', 'PDF komprimieren', 'Сжать PDF', '压缩 PDF'],
  ['Reorder, rotate or delete PDF pages', 'Reordenar, girar o eliminar páginas de PDF', 'Réordonner, pivoter ou supprimer des pages PDF', 'PDF-Seiten ordnen, drehen oder löschen', 'Переставить, повернуть или удалить страницы PDF', '重新排序、旋转或删除 PDF 页面'],
  ['Convert audio', 'Convertir audio', 'Convertir de l\'audio', 'Audio umwandeln', 'Конвертировать аудио', '转换音频'],
  ['Trim audio', 'Recortar audio', 'Couper de l\'audio', 'Audio zuschneiden', 'Обрезать аудио', '剪辑音频'],
  ['Even out audio volume', 'Igualar el volumen del audio', 'Égaliser le volume audio', 'Audiolautstärke angleichen', 'Выровнять громкость аудио', '统一音频音量'],
  ['under 10 MB', 'menos de 10 MB', 'moins de 10 Mo', 'unter 10 MB', 'меньше 10 МБ', '小于 10 MB'],
  ['under 25 MB', 'menos de 25 MB', 'moins de 25 Mo', 'unter 25 MB', 'меньше 25 МБ', '小于 25 MB'],
  ['under 16 MB', 'menos de 16 MB', 'moins de 16 Mo', 'unter 16 MB', 'меньше 16 МБ', '小于 16 MB'],
  ['HEIC to JPG', 'de HEIC a JPG', 'HEIC vers JPG', 'HEIC zu JPG', 'из HEIC в JPG', 'HEIC 转 JPG'],
  ['draw or type a signature', 'dibuja o escribe una firma', 'dessinez ou tapez une signature', 'Unterschrift zeichnen oder tippen', 'нарисуйте или напечатайте подпись', '手写或输入签名'],
  ['combine files', 'combina archivos', 'combiner des fichiers', 'Dateien kombinieren', 'объединить файлы', '合并文件'],
  ['keep one part', 'quédate con una parte', 'garder un passage', 'einen Teil behalten', 'оставить часть', '保留一段'],
  ['2–6 seconds', '2–6 segundos', '2 à 6 secondes', '2–6 Sekunden', '2–6 секунд', '2–6 秒'],
  ['save as MP3', 'guardar como MP3', 'enregistrer en MP3', 'als MP3 speichern', 'сохранить в MP3', '保存为 MP3'],
  ['keep the picture', 'mantener la imagen', 'garder l\'image', 'Bild behalten', 'оставить картинку', '保留画面'],
  ['by size or %', 'por tamaño o %', 'par taille ou %', 'nach Größe oder %', 'по размеру или в %', '按尺寸或百分比'],
  ['smaller files', 'archivos más pequeños', 'fichiers plus légers', 'kleinere Dateien', 'файлы меньше', '更小的文件'],
  ['JPG, PNG or WebP', 'JPG, PNG o WebP', 'JPG, PNG ou WebP', 'JPG, PNG oder WebP', 'JPG, PNG или WebP', 'JPG、PNG 或 WebP'],
  ['one page each', 'una página cada una', 'une page chacune', 'je eine Seite', 'по странице на каждое', '每张一页'],
  ['pages or ranges', 'páginas o rangos', 'pages ou plages', 'Seiten oder Bereiche', 'страницы или диапазоны', '页面或范围'],
  ['for email and portals', 'para email y portales', 'pour e-mail et portails', 'für E-Mail und Portale', 'для почты и порталов', '适合邮件和上传平台'],
  ['organize', 'organizar', 'organiser', 'ordnen', 'упорядочить', '整理'],
  ['MP3, M4A, WAV, FLAC', 'MP3, M4A, WAV, FLAC', 'MP3, M4A, WAV, FLAC', 'MP3, M4A, WAV, FLAC', 'MP3, M4A, WAV, FLAC', 'MP3、M4A、WAV、FLAC'],
  ['ringtones, voice notes', 'tonos, notas de voz', 'sonneries, mémos vocaux', 'Klingeltöne, Sprachnotizen', 'рингтоны, голосовые', '铃声、语音备忘'],
  ['quiet or loud recordings', 'grabaciones bajas o altas', 'enregistrements trop faibles ou trop forts', 'leise oder laute Aufnahmen', 'тихие или громкие записи', '太小或太大的录音'],
  ['everything Filesmith made', 'todo lo que hizo Filesmith', 'tout ce que Filesmith a créé', 'alles, was Filesmith erstellt hat', 'всё, что сделал Filesmith', 'Filesmith 生成的所有文件'],
  ['output folder, appearance', 'carpeta de salida, aspecto', 'dossier de sortie, apparence', 'Zielordner, Erscheinungsbild', 'папка сохранения, оформление', '输出文件夹、外观'],

  // Tool pages
  ['Shrink videos for Discord or email, trim them, make GIFs.', 'Reduce vídeos para Discord o email, recórtalos y crea GIF.', 'Réduisez vos vidéos pour Discord ou l\'e-mail, coupez-les, créez des GIF.', 'Videos für Discord oder E-Mail verkleinern, zuschneiden, GIFs erstellen.', 'Уменьшайте видео для Discord или почты, обрезайте, делайте GIF.', '为 Discord 或邮件压缩视频、剪辑、制作 GIF。'],
  ['Convert iPhone photos, resize and compress, hundreds at a time.', 'Convierte fotos de iPhone, redimensiona y comprime, cientos a la vez.', 'Convertissez des photos d\'iPhone, redimensionnez et compressez, par centaines.', 'iPhone-Fotos umwandeln, verkleinern und komprimieren, hunderte auf einmal.', 'Конвертируйте фото iPhone, меняйте размер и сжимайте сотнями за раз.', '转换 iPhone 照片、调整尺寸和压缩，一次处理上百张。'],
  ['Convert, cut and fix the volume of songs, voice notes and podcasts.', 'Convierte, corta y arregla el volumen de canciones, notas de voz y podcasts.', 'Convertissez, coupez et réglez le volume de chansons, mémos et podcasts.', 'Songs, Sprachnotizen und Podcasts umwandeln, schneiden und in der Lautstärke angleichen.', 'Конвертируйте, обрезайте и выравнивайте громкость песен, голосовых и подкастов.', '转换、剪辑歌曲、语音备忘和播客，并调整音量。'],
  ['Merge, split, sign and shrink PDFs without uploading them anywhere.', 'Une, divide, firma y reduce PDF sin subirlos a ningún sitio.', 'Fusionnez, divisez, signez et réduisez des PDF sans les envoyer nulle part.', 'PDFs zusammenführen, teilen, unterschreiben und verkleinern, ohne sie hochzuladen.', 'Объединяйте, разделяйте, подписывайте и сжимайте PDF, ничего не загружая.', '合并、拆分、签署和压缩 PDF，无需上传到任何地方。'],
  ['Add video', 'Añadir vídeo', 'Ajouter une vidéo', 'Video hinzufügen', 'Добавить видео', '添加视频'],
  ['Add images', 'Añadir imágenes', 'Ajouter des images', 'Bilder hinzufügen', 'Добавить изображения', '添加图片'],
  ['Add audio', 'Añadir audio', 'Ajouter de l\'audio', 'Audio hinzufügen', 'Добавить аудио', '添加音频'],
  ['No video yet', 'Aún no hay vídeos', 'Aucune vidéo', 'Noch kein Video', 'Видео пока нет', '还没有视频'],
  ['No images yet', 'Aún no hay imágenes', 'Aucune image', 'Noch keine Bilder', 'Изображений пока нет', '还没有图片'],
  ['No audio yet', 'Aún no hay audio', 'Aucun audio', 'Noch kein Audio', 'Аудио пока нет', '还没有音频'],
  ['No PDFs yet', 'Aún no hay PDF', 'Aucun PDF', 'Noch keine PDFs', 'PDF пока нет', '还没有 PDF'],
  ['Choose video…', 'Elegir vídeos…', 'Choisir des vidéos…', 'Videos wählen…', 'Выбрать видео…', '选择视频…'],
  ['Choose images…', 'Elegir imágenes…', 'Choisir des images…', 'Bilder wählen…', 'Выбрать изображения…', '选择图片…'],
  ['Choose audio…', 'Elegir audio…', 'Choisir de l\'audio…', 'Audio wählen…', 'Выбрать аудио…', '选择音频…'],
  ['Choose PDFs…', 'Elegir PDF…', 'Choisir des PDF…', 'PDFs wählen…', 'Выбрать PDF…', '选择 PDF…'],
  ['Drop files anywhere in the window, or choose them.', 'Suelta archivos en cualquier parte de la ventana o elígelos.', 'Déposez des fichiers dans la fenêtre ou choisissez-les.', 'Dateien ins Fenster ziehen oder auswählen.', 'Перетащите файлы в окно или выберите их.', '把文件拖到窗口任意位置，或手动选择。'],
  ['Clear all', 'Borrar todo', 'Tout effacer', 'Alle entfernen', 'Очистить всё', '全部清除'],
  ['Add more', 'Añadir más', 'Ajouter', 'Weitere hinzufügen', 'Добавить ещё', '继续添加'],
  ['Open', 'Abrir', 'Ouvrir', 'Öffnen', 'Открыть', '打开'],
  ['Show in folder', 'Mostrar en la carpeta', 'Afficher dans le dossier', 'Im Ordner zeigen', 'Показать в папке', '在文件夹中显示'],
  ['Remove', 'Quitar', 'Retirer', 'Entfernen', 'Убрать', '移除'],
  ['Ready', 'Listo', 'Prêt', 'Bereit', 'Готов', '就绪'],
  ['Waiting', 'En espera', 'En attente', 'Wartet', 'Ожидание', '等待中'],
  ['Done', 'Hecho', 'Terminé', 'Fertig', 'Готово', '完成'],
  ['Skipped', 'Omitido', 'Ignoré', 'Übersprungen', 'Пропущено', '已跳过'],
  ['Failed', 'Falló', 'Échec', 'Fehlgeschlagen', 'Ошибка', '失败'],
  ['Cancel', 'Cancelar', 'Annuler', 'Abbrechen', 'Отмена', '取消'],
  ['Working…', 'Trabajando…', 'En cours…', 'Wird bearbeitet…', 'Обработка…', '处理中…'],
  ['Saved next to the original · originals are never changed', 'Se guarda junto al original · los originales nunca cambian', 'Enregistré à côté de l\'original · les originaux ne changent jamais', 'Neben dem Original gespeichert · Originale bleiben unverändert', 'Сохраняется рядом с оригиналом · оригиналы не меняются', '保存在原文件旁边 · 原文件永不改动'],
  ['Originals are never changed', 'Los originales nunca cambian', 'Les originaux ne changent jamais', 'Originale bleiben unverändert', 'Оригиналы не меняются', '原文件永不改动'],

  // Actions
  ['Compress', 'Comprimir', 'Compresser', 'Komprimieren', 'Сжать', '压缩'],
  ['Trim', 'Recortar', 'Couper', 'Zuschneiden', 'Обрезать', '剪辑'],
  ['Make GIF', 'Crear GIF', 'Créer un GIF', 'GIF erstellen', 'Сделать GIF', '制作 GIF'],
  ['Extract audio', 'Extraer audio', 'Extraire l\'audio', 'Audio extrahieren', 'Извлечь звук', '提取音频'],
  ['Convert to MP4', 'Convertir a MP4', 'Convertir en MP4', 'In MP4 umwandeln', 'Конвертировать в MP4', '转换为 MP4'],
  ['Remove sound', 'Quitar sonido', 'Supprimer le son', 'Ton entfernen', 'Убрать звук', '去除声音'],
  ['Convert', 'Convertir', 'Convertir', 'Umwandeln', 'Конвертировать', '转换'],
  ['Resize', 'Redimensionar', 'Redimensionner', 'Größe ändern', 'Размер', '调整尺寸'],
  ['Make a PDF', 'Crear un PDF', 'Créer un PDF', 'PDF erstellen', 'Сделать PDF', '制作 PDF'],
  ['Even out volume', 'Igualar volumen', 'Égaliser le volume', 'Lautstärke angleichen', 'Выровнять громкость', '统一音量'],
  ['Merge', 'Unir', 'Fusionner', 'Zusammenführen', 'Объединить', '合并'],
  ['Split', 'Dividir', 'Diviser', 'Teilen', 'Разделить', '拆分'],
  ['Organize pages', 'Organizar páginas', 'Organiser les pages', 'Seiten ordnen', 'Упорядочить страницы', '整理页面'],
  ['Sign & fill', 'Firmar y rellenar', 'Signer et remplir', 'Unterschreiben & ausfüllen', 'Подписать и заполнить', '签署与填写'],
  ['Images to PDF', 'Imágenes a PDF', 'Images en PDF', 'Bilder zu PDF', 'Изображения в PDF', '图片转 PDF'],

  // Video options
  ['Compress video', 'Comprimir vídeo', 'Compresser la vidéo', 'Video komprimieren', 'Сжать видео', '压缩视频'],
  ['Pick a size limit and Filesmith squeezes each video just under it.', 'Elige un límite de tamaño y Filesmith deja cada vídeo justo por debajo.', 'Choisissez une limite de taille et Filesmith place chaque vidéo juste en dessous.', 'Wähle eine Größengrenze und Filesmith bringt jedes Video knapp darunter.', 'Выберите лимит размера, и Filesmith уложит каждое видео чуть меньше.', '选一个大小上限，Filesmith 会把每个视频压到刚好低于它。'],
  ['Aim for', 'Objetivo', 'Viser', 'Ziel', 'Цель', '目标'],
  ['A file size', 'Un tamaño de archivo', 'Une taille de fichier', 'Eine Dateigröße', 'Размер файла', '文件大小'],
  ['A quality level', 'Un nivel de calidad', 'Un niveau de qualité', 'Eine Qualitätsstufe', 'Уровень качества', '画质等级'],
  ['Size limit', 'Límite de tamaño', 'Limite de taille', 'Größengrenze', 'Лимит размера', '大小上限'],
  ['Discord', 'Discord', 'Discord', 'Discord', 'Discord', 'Discord'],
  ['WhatsApp', 'WhatsApp', 'WhatsApp', 'WhatsApp', 'WhatsApp', 'WhatsApp'],
  ['Email', 'Email', 'E-mail', 'E-Mail', 'Почта', '邮件'],
  ['Or type your own (MB)', 'O escribe el tuyo (MB)', 'Ou saisissez votre valeur (Mo)', 'Oder eigenen Wert eingeben (MB)', 'Или введите своё (МБ)', '或自定义（MB）'],
  ['Long videos get a lower resolution so they still fit. Videos already under the limit are skipped.', 'Los vídeos largos bajan de resolución para que quepan. Los que ya están por debajo del límite se omiten.', 'Les longues vidéos baissent en résolution pour tenir. Celles déjà sous la limite sont ignorées.', 'Lange Videos bekommen eine niedrigere Auflösung, damit sie passen. Videos unter dem Limit werden übersprungen.', 'Длинные видео уменьшают разрешение, чтобы уложиться. Видео, которые уже меньше лимита, пропускаются.', '长视频会降低分辨率以符合限制。已经低于上限的视频会被跳过。'],
  ['Quality', 'Calidad', 'Qualité', 'Qualität', 'Качество', '画质'],
  ['High', 'Alta', 'Haute', 'Hoch', 'Высокое', '高'],
  ['Balanced', 'Equilibrada', 'Équilibrée', 'Ausgewogen', 'Сбалансированное', '均衡'],
  ['Smallest', 'Mínima', 'Minimale', 'Kleinste', 'Минимальное', '最小'],
  ['Trim video', 'Recortar vídeo', 'Couper la vidéo', 'Video zuschneiden', 'Обрезать видео', '剪辑视频'],
  ['Drag the handles under the video to keep only the part you want.', 'Arrastra los tiradores bajo el vídeo para quedarte solo con lo que quieres.', 'Faites glisser les poignées sous la vidéo pour ne garder que le passage voulu.', 'Zieh die Griffe unter dem Video, um nur den gewünschten Teil zu behalten.', 'Перетащите ползунки под видео, чтобы оставить только нужную часть.', '拖动视频下方的滑块，只保留你想要的部分。'],
  ['Remove the sound too', 'Quitar también el sonido', 'Supprimer aussi le son', 'Ton auch entfernen', 'Также убрать звук', '同时去除声音'],
  ['Make a GIF', 'Crear un GIF', 'Créer un GIF', 'GIF erstellen', 'Сделать GIF', '制作 GIF'],
  ['Pick a short moment under the video. 2–6 seconds works best.', 'Elige un momento corto bajo el vídeo. Lo mejor son 2–6 segundos.', 'Choisissez un court passage sous la vidéo. 2 à 6 secondes, c\'est l\'idéal.', 'Wähle unter dem Video einen kurzen Moment. 2–6 Sekunden sind ideal.', 'Выберите короткий момент под видео. Лучше всего 2–6 секунд.', '在视频下方选一小段，2–6 秒效果最好。'],
  ['Smoothness', 'Fluidez', 'Fluidité', 'Flüssigkeit', 'Плавность', '流畅度'],
  ['Width', 'Ancho', 'Largeur', 'Breite', 'Ширина', '宽度'],
  ['tiny', 'mínimo', 'minuscule', 'winzig', 'крошечный', '很小'],
  ['big', 'grande', 'grand', 'groß', 'большой', '大'],
  ['GIFs longer than 15 seconds get huge. Try a shorter clip.', 'Los GIF de más de 15 segundos pesan mucho. Prueba un fragmento más corto.', 'Les GIF de plus de 15 secondes deviennent énormes. Essayez un extrait plus court.', 'GIFs über 15 Sekunden werden riesig. Nimm einen kürzeren Ausschnitt.', 'GIF длиннее 15 секунд получаются огромными. Выберите фрагмент короче.', '超过 15 秒的 GIF 会非常大，试试更短的片段。'],
  ['Saves the sound from each video as an MP3 (192 kbps).', 'Guarda el sonido de cada vídeo como MP3 (192 kbps).', 'Enregistre le son de chaque vidéo en MP3 (192 kbit/s).', 'Speichert den Ton jedes Videos als MP3 (192 kbit/s).', 'Сохраняет звук каждого видео в MP3 (192 кбит/с).', '把每个视频的声音保存为 MP3（192 kbps）。'],
  ['Handy for songs, lectures and voice clips.', 'Útil para canciones, clases y clips de voz.', 'Pratique pour les chansons, cours et extraits vocaux.', 'Praktisch für Songs, Vorlesungen und Sprachclips.', 'Удобно для песен, лекций и голосовых записей.', '适合歌曲、讲座和语音片段。'],
  ['Turns MOV, MKV, WEBM, AVI and iPhone videos into MP4, which plays on everything.', 'Convierte vídeos MOV, MKV, WEBM, AVI y de iPhone en MP4, que se reproduce en todas partes.', 'Transforme les vidéos MOV, MKV, WEBM, AVI et d\'iPhone en MP4, lisible partout.', 'Macht aus MOV, MKV, WEBM, AVI und iPhone-Videos MP4, das überall läuft.', 'Превращает MOV, MKV, WEBM, AVI и видео с iPhone в MP4, который открывается везде.', '把 MOV、MKV、WEBM、AVI 和 iPhone 视频转换为到处都能播放的 MP4。'],
  ['Keeps the picture exactly as it is and drops the audio. Takes a second.', 'Mantiene la imagen tal cual y quita el audio. Tarda un segundo.', 'Garde l\'image telle quelle et retire l\'audio. Ça prend une seconde.', 'Lässt das Bild unverändert und entfernt den Ton. Dauert eine Sekunde.', 'Оставляет картинку как есть и убирает звук. Занимает секунду.', '画面保持不变，只去掉音频，只需一秒。'],
  ['Start', 'Inicio', 'Début', 'Start', 'Начало', '开始'],
  ['End', 'Fin', 'Fin', 'Ende', 'Конец', '结束'],
  ['Length', 'Duración', 'Durée', 'Länge', 'Длина', '时长'],
  ['Start here', 'Empezar aquí', 'Début ici', 'Hier beginnen', 'Начать здесь', '从这里开始'],
  ['End here', 'Terminar aquí', 'Fin ici', 'Hier enden', 'Закончить здесь', '到这里结束'],
  ['Play selection', 'Reproducir selección', 'Lire la sélection', 'Auswahl abspielen', 'Воспроизвести выбранное', '播放选中部分'],

  // Image options
  ['Works on iPhone HEIC photos, PNG, WebP, GIF, BMP and TIFF.', 'Funciona con fotos HEIC de iPhone, PNG, WebP, GIF, BMP y TIFF.', 'Fonctionne avec les photos HEIC d\'iPhone, PNG, WebP, GIF, BMP et TIFF.', 'Funktioniert mit iPhone-HEIC-Fotos, PNG, WebP, GIF, BMP und TIFF.', 'Работает с фото HEIC с iPhone, PNG, WebP, GIF, BMP и TIFF.', '支持 iPhone HEIC 照片、PNG、WebP、GIF、BMP 和 TIFF。'],
  ['Convert to', 'Convertir a', 'Convertir en', 'Umwandeln in', 'Конвертировать в', '转换为'],
  ['Quality:', 'Calidad:', 'Qualité :', 'Qualität:', 'Качество:', '画质：'],
  ['Strength:', 'Intensidad:', 'Intensité :', 'Stärke:', 'Сила:', '强度：'],
  ['Resize images', 'Redimensionar imágenes', 'Redimensionner des images', 'Bildgröße ändern', 'Изменить размер изображений', '调整图片尺寸'],
  ['Make photos smaller in pixels. Images never get stretched or made bigger.', 'Reduce el tamaño en píxeles. Las imágenes nunca se deforman ni se agrandan.', 'Réduisez la taille en pixels. Les images ne sont jamais étirées ni agrandies.', 'Fotos in Pixeln verkleinern. Bilder werden nie verzerrt oder vergrößert.', 'Уменьшайте фото в пикселях. Изображения не растягиваются и не увеличиваются.', '缩小照片像素尺寸，图片绝不会被拉伸或放大。'],
  ['How', 'Cómo', 'Méthode', 'Wie', 'Способ', '方式'],
  ['Longest side', 'Lado más largo', 'Plus grand côté', 'Längste Seite', 'Длинная сторона', '最长边'],
  ['Percentage', 'Porcentaje', 'Pourcentage', 'Prozent', 'Проценты', '百分比'],
  ['Save as', 'Guardar como', 'Enregistrer en', 'Speichern als', 'Сохранить как', '保存为'],
  ['Same as original', 'Igual que el original', 'Comme l\'original', 'Wie das Original', 'Как в оригинале', '与原文件相同'],
  ['Smaller files that look the same. Great before emailing or uploading.', 'Archivos más pequeños que se ven igual. Ideal antes de enviar o subir.', 'Des fichiers plus légers, identiques à l\'œil. Idéal avant un envoi.', 'Kleinere Dateien, die gleich aussehen. Ideal vor dem Versenden oder Hochladen.', 'Файлы меньше, а выглядят так же. Удобно перед отправкой.', '文件更小，看起来一样，发邮件或上传前很合适。'],

  // Audio options
  ['Change the format of songs, recordings and voice notes.', 'Cambia el formato de canciones, grabaciones y notas de voz.', 'Changez le format de chansons, enregistrements et mémos vocaux.', 'Format von Songs, Aufnahmen und Sprachnotizen ändern.', 'Меняйте формат песен, записей и голосовых заметок.', '更改歌曲、录音和语音备忘的格式。'],
  ['Drag the handles to keep only the part you want. Makes great ringtones.', 'Arrastra los tiradores para quedarte solo con lo que quieres. Perfecto para tonos.', 'Faites glisser les poignées pour garder le passage voulu. Idéal pour les sonneries.', 'Zieh die Griffe, um nur den gewünschten Teil zu behalten. Perfekt für Klingeltöne.', 'Перетащите ползунки, чтобы оставить нужную часть. Отлично для рингтонов.', '拖动滑块只保留想要的部分，做铃声很合适。'],
  ['Makes quiet recordings louder and loud ones softer, to the level Spotify and YouTube use.', 'Sube las grabaciones bajas y baja las altas, al nivel que usan Spotify y YouTube.', 'Rend les enregistrements faibles plus forts et les forts plus doux, au niveau de Spotify et YouTube.', 'Macht leise Aufnahmen lauter und laute leiser, auf das Niveau von Spotify und YouTube.', 'Делает тихие записи громче, а громкие тише, до уровня Spotify и YouTube.', '让小声的录音变大、大声的变小，达到 Spotify 和 YouTube 的标准响度。'],
  ['small', 'pequeño', 'léger', 'klein', 'малый', '小'],
  ['best', 'máxima', 'meilleure', 'beste', 'лучшее', '最佳'],

  // PDF
  ['Combines files top to bottom into one PDF. Drag to reorder.', 'Combina los archivos de arriba abajo en un PDF. Arrastra para reordenar.', 'Combine les fichiers de haut en bas en un seul PDF. Faites glisser pour réordonner.', 'Kombiniert die Dateien von oben nach unten zu einem PDF. Zum Umsortieren ziehen.', 'Объединяет файлы сверху вниз в один PDF. Перетащите, чтобы изменить порядок.', '按从上到下的顺序合并为一个 PDF，拖动可调整顺序。'],
  ['Add at least 2 PDFs', 'Añade al menos 2 PDF', 'Ajoutez au moins 2 PDF', 'Mindestens 2 PDFs hinzufügen', 'Добавьте хотя бы 2 PDF', '至少添加 2 个 PDF'],
  ['Add two or more PDFs to combine them.', 'Añade dos o más PDF para combinarlos.', 'Ajoutez deux PDF ou plus pour les combiner.', 'Füge zwei oder mehr PDFs hinzu, um sie zu kombinieren.', 'Добавьте два или больше PDF, чтобы объединить их.', '添加两个或以上的 PDF 来合并。'],
  ['Drop a PDF anywhere in the window, or choose one.', 'Suelta un PDF en la ventana o elige uno.', 'Déposez un PDF dans la fenêtre ou choisissez-en un.', 'Zieh ein PDF ins Fenster oder wähle eins aus.', 'Перетащите PDF в окно или выберите его.', '把 PDF 拖到窗口任意位置，或手动选择。'],
  ['Each image becomes one page. JPG, PNG, HEIC and WebP work.', 'Cada imagen es una página. Funcionan JPG, PNG, HEIC y WebP.', 'Chaque image devient une page. JPG, PNG, HEIC et WebP fonctionnent.', 'Jedes Bild wird eine Seite. JPG, PNG, HEIC und WebP funktionieren.', 'Каждое изображение становится страницей. Подходят JPG, PNG, HEIC и WebP.', '每张图片一页，支持 JPG、PNG、HEIC 和 WebP。'],
  ['Split a PDF', 'Dividir un PDF', 'Diviser un PDF', 'PDF teilen', 'Разделить PDF', '拆分 PDF'],
  ['Add a PDF.', 'Añade un PDF.', 'Ajoutez un PDF.', 'Füge ein PDF hinzu.', 'Добавьте PDF.', '请添加一个 PDF。'],
  ['Every page', 'Cada página', 'Chaque page', 'Jede Seite', 'Каждая страница', '逐页'],
  ['By ranges', 'Por rangos', 'Par plages', 'Nach Bereichen', 'По диапазонам', '按范围'],
  ['Pick pages', 'Elegir páginas', 'Choisir des pages', 'Seiten wählen', 'Выбрать страницы', '挑选页面'],
  ['Ranges (each becomes its own file)', 'Rangos (cada uno es un archivo)', 'Plages (chacune devient un fichier)', 'Bereiche (jeder wird eine eigene Datei)', 'Диапазоны (каждый — отдельный файл)', '范围（每个范围单独成文件）'],
  ['Pages to keep (one new file)', 'Páginas que conservar (un archivo nuevo)', 'Pages à garder (un nouveau fichier)', 'Zu behaltende Seiten (eine neue Datei)', 'Оставить страницы (один новый файл)', '要保留的页面（生成一个新文件）'],
  ['Makes one PDF per page.', 'Crea un PDF por página.', 'Crée un PDF par page.', 'Erstellt ein PDF pro Seite.', 'Создаёт по PDF на каждую страницу.', '每页生成一个 PDF。'],
  ['Split PDF', 'Dividir PDF', 'Diviser le PDF', 'PDF teilen', 'Разделить PDF', '拆分 PDF'],
  ['Compress PDFs', 'Comprimir PDF', 'Compresser des PDF', 'PDFs komprimieren', 'Сжать PDF', '压缩 PDF'],
  ['Compress PDF', 'Comprimir PDF', 'Compresser le PDF', 'PDF komprimieren', 'Сжать PDF', '压缩 PDF'],
  ['Shrink PDFs for email, uploads and school portals.', 'Reduce PDF para email, subidas y portales escolares.', 'Réduisez des PDF pour l\'e-mail, les envois et les portails scolaires.', 'PDFs für E-Mail, Uploads und Schulportale verkleinern.', 'Уменьшайте PDF для почты, загрузок и школьных порталов.', '压缩 PDF，方便发邮件、上传和提交到学校平台。'],
  ['Strength', 'Intensidad', 'Intensité', 'Stärke', 'Сила', '强度'],
  ['Light', 'Ligera', 'Légère', 'Leicht', 'Лёгкое', '轻度'],
  ['Strong', 'Fuerte', 'Forte', 'Stark', 'Сильное', '强力'],
  ['keeps text', 'mantiene el texto', 'garde le texte', 'Text bleibt', 'сохраняет текст', '保留文字'],
  ['scans & photos', 'escaneos y fotos', 'scans et photos', 'Scans & Fotos', 'сканы и фото', '扫描件与照片'],
  ['Sharpness', 'Nitidez', 'Netteté', 'Schärfe', 'Чёткость', '清晰度'],
  ['Small', 'Pequeña', 'Petite', 'Klein', 'Малая', '小'],
  ['Sharp', 'Nítida', 'Nette', 'Scharf', 'Чёткая', '清晰'],
  ['Drag pages to reorder. Hover a page to rotate or delete it.', 'Arrastra las páginas para reordenarlas. Pasa el ratón para girarlas o eliminarlas.', 'Faites glisser les pages pour les réordonner. Survolez-en une pour la pivoter ou la supprimer.', 'Seiten zum Umsortieren ziehen. Mit der Maus über eine Seite fahren, um sie zu drehen oder zu löschen.', 'Перетаскивайте страницы, чтобы менять порядок. Наведите на страницу, чтобы повернуть или удалить.', '拖动页面可重新排序，鼠标悬停可旋转或删除。'],
  ['File', 'Archivo', 'Fichier', 'Datei', 'Файл', '文件'],
  ['Rotate all', 'Girar todo', 'Tout pivoter', 'Alle drehen', 'Повернуть все', '全部旋转'],
  ['Reset', 'Restablecer', 'Réinitialiser', 'Zurücksetzen', 'Сбросить', '重置'],
  ['Rotate', 'Girar', 'Pivoter', 'Drehen', 'Повернуть', '旋转'],
  ['Delete', 'Eliminar', 'Supprimer', 'Löschen', 'Удалить', '删除'],
  ['Save new PDF', 'Guardar PDF nuevo', 'Enregistrer le nouveau PDF', 'Neues PDF speichern', 'Сохранить новый PDF', '保存新 PDF'],
  ['Loading pages…', 'Cargando páginas…', 'Chargement des pages…', 'Seiten werden geladen…', 'Загрузка страниц…', '正在加载页面…'],
  ['Add your signature, a name or a date, then drag it into place.', 'Añade tu firma, un nombre o una fecha y arrástralos a su sitio.', 'Ajoutez votre signature, un nom ou une date, puis placez-les en les faisant glisser.', 'Füge Unterschrift, Namen oder Datum hinzu und zieh sie an die richtige Stelle.', 'Добавьте подпись, имя или дату и перетащите на место.', '添加签名、姓名或日期，然后拖到合适的位置。'],
  ['Create signature', 'Crear firma', 'Créer une signature', 'Unterschrift erstellen', 'Создать подпись', '创建签名'],
  ['Add my signature', 'Añadir mi firma', 'Ajouter ma signature', 'Meine Unterschrift einfügen', 'Добавить мою подпись', '添加我的签名'],
  ['Make a new signature', 'Crear una firma nueva', 'Créer une nouvelle signature', 'Neue Unterschrift erstellen', 'Создать новую подпись', '重新创建签名'],
  ['Add text', 'Añadir texto', 'Ajouter du texte', 'Text hinzufügen', 'Добавить текст', '添加文字'],
  ["Add today's date", 'Añadir la fecha de hoy', 'Ajouter la date du jour', 'Heutiges Datum einfügen', 'Добавить сегодняшнюю дату', '添加今天的日期'],
  ['Drag items to move them, use the corner to resize, and the × to remove.', 'Arrastra los elementos para moverlos, usa la esquina para cambiar el tamaño y la × para quitarlos.', 'Faites glisser les éléments pour les déplacer, utilisez le coin pour redimensionner et × pour retirer.', 'Elemente zum Verschieben ziehen, mit der Ecke die Größe ändern, mit × entfernen.', 'Перетаскивайте элементы, меняйте размер за угол, удаляйте кнопкой ×.', '拖动可移动，拖角可调整大小，点 × 可移除。'],
  ['Save signed PDF', 'Guardar PDF firmado', 'Enregistrer le PDF signé', 'Unterschriebenes PDF speichern', 'Сохранить подписанный PDF', '保存已签署的 PDF'],
  ['Your signature', 'Tu firma', 'Votre signature', 'Deine Unterschrift', 'Ваша подпись', '你的签名'],
  ['Draw', 'Dibujar', 'Dessiner', 'Zeichnen', 'Нарисовать', '手写'],
  ['Type', 'Escribir', 'Taper', 'Tippen', 'Напечатать', '输入'],
  ['Black', 'Negro', 'Noir', 'Schwarz', 'Чёрный', '黑色'],
  ['Blue', 'Azul', 'Bleu', 'Blau', 'Синий', '蓝色'],
  ['Clear', 'Borrar', 'Effacer', 'Löschen', 'Очистить', '清除'],
  ['Use signature', 'Usar firma', 'Utiliser la signature', 'Unterschrift verwenden', 'Использовать подпись', '使用签名'],
  ['Saved only on this computer so you can reuse it.', 'Se guarda solo en este ordenador para reutilizarla.', 'Enregistrée uniquement sur cet ordinateur pour la réutiliser.', 'Nur auf diesem Computer gespeichert, damit du sie wiederverwenden kannst.', 'Сохраняется только на этом компьютере, чтобы использовать снова.', '只保存在这台电脑上，方便下次使用。'],
  ['Type your name', 'Escribe tu nombre', 'Tapez votre nom', 'Namen eingeben', 'Введите имя', '输入你的名字'],
  ['Your name, an address, anything', 'Tu nombre, una dirección, lo que sea', 'Votre nom, une adresse, n\'importe quoi', 'Dein Name, eine Adresse, irgendwas', 'Имя, адрес, что угодно', '名字、地址，什么都行'],
  ['Place it', 'Colocar', 'Placer', 'Platzieren', 'Разместить', '放置'],
  ['Each image becomes a page, in the order on the left. Phone photos are turned the right way up.', 'Cada imagen es una página, en el orden de la izquierda. Las fotos del móvil se giran bien.', 'Chaque image devient une page, dans l\'ordre de gauche. Les photos de téléphone sont remises à l\'endroit.', 'Jedes Bild wird eine Seite, in der Reihenfolge links. Handyfotos werden richtig gedreht.', 'Каждое изображение — страница в порядке слева. Фото с телефона поворачиваются правильно.', '每张图片一页，按左侧顺序排列，手机照片会自动摆正。'],
  ['Page size', 'Tamaño de página', 'Format de page', 'Seitengröße', 'Размер страницы', '页面大小'],
  ['Same as image', 'Igual que la imagen', 'Comme l\'image', 'Wie das Bild', 'Как у изображения', '与图片相同'],
  ['Margin', 'Margen', 'Marge', 'Rand', 'Поля', '边距'],
  ['None', 'Ninguno', 'Aucune', 'Kein', 'Нет', '无'],
  ['Normal', 'Normal', 'Normale', 'Normal', 'Обычные', '正常'],
  ['Make PDF', 'Crear PDF', 'Créer le PDF', 'PDF erstellen', 'Создать PDF', '生成 PDF'],
  ['PDF saved', 'PDF guardado', 'PDF enregistré', 'PDF gespeichert', 'PDF сохранён', 'PDF 已保存'],
  ["can't read this PDF", 'no se puede leer este PDF', 'PDF illisible', 'PDF nicht lesbar', 'не удаётся прочитать PDF', '无法读取此 PDF'],
  ["This PDF can't be opened.", 'Este PDF no se puede abrir.', 'Ce PDF ne peut pas être ouvert.', 'Dieses PDF lässt sich nicht öffnen.', 'Этот PDF не открывается.', '无法打开此 PDF。'],
  ['A PDF needs at least one page.', 'Un PDF necesita al menos una página.', 'Un PDF doit avoir au moins une page.', 'Ein PDF braucht mindestens eine Seite.', 'В PDF должна быть хотя бы одна страница.', 'PDF 至少需要一页。'],
  ['Already as small as it gets with Light. Try Strong.', 'Ya es lo más pequeño posible con Ligera. Prueba Fuerte.', 'Déjà au minimum avec Légère. Essayez Forte.', 'Mit Leicht geht es nicht kleiner. Versuch Stark.', 'С лёгким сжатием меньше не получится. Попробуйте сильное.', '轻度压缩已经是最小了，试试强力压缩。'],
  ["This PDF is already compact. Filesmith didn't save a bigger copy.", 'Este PDF ya es compacto. Filesmith no guardó una copia más grande.', 'Ce PDF est déjà compact. Filesmith n\'a pas enregistré de copie plus lourde.', 'Dieses PDF ist schon kompakt. Filesmith hat keine größere Kopie gespeichert.', 'Этот PDF уже компактный. Filesmith не сохранил копию больше.', '这个 PDF 已经很小，Filesmith 没有保存更大的副本。'],
  ['Draw your signature first.', 'Dibuja tu firma primero.', 'Dessinez d\'abord votre signature.', 'Zeichne zuerst deine Unterschrift.', 'Сначала нарисуйте подпись.', '请先手写签名。'],
  ['Type your name first.', 'Escribe tu nombre primero.', 'Tapez d\'abord votre nom.', 'Gib zuerst deinen Namen ein.', 'Сначала введите имя.', '请先输入名字。'],
  ['That would make more than 300 files. Use ranges instead.', 'Eso crearía más de 300 archivos. Usa rangos.', 'Cela créerait plus de 300 fichiers. Utilisez des plages.', 'Das wären über 300 Dateien. Nutze lieber Bereiche.', 'Получится больше 300 файлов. Используйте диапазоны.', '这样会生成超过 300 个文件，请改用范围。'],
  ['Type which pages you want, like 1-3, 5.', 'Escribe qué páginas quieres, por ejemplo 1-3, 5.', 'Indiquez les pages voulues, par exemple 1-3, 5.', 'Gib die gewünschten Seiten ein, z. B. 1-3, 5.', 'Укажите нужные страницы, например 1-3, 5.', '请输入想要的页面，例如 1-3, 5。'],

  // History, settings, support
  ['Everything Filesmith made for you. Kept only on this computer.', 'Todo lo que Filesmith hizo por ti. Se guarda solo en este ordenador.', 'Tout ce que Filesmith a créé pour vous. Conservé uniquement sur cet ordinateur.', 'Alles, was Filesmith für dich erstellt hat. Nur auf diesem Computer gespeichert.', 'Всё, что Filesmith сделал для вас. Хранится только на этом компьютере.', 'Filesmith 为你生成的所有文件，只保存在这台电脑上。'],
  ['Nothing yet. Drop a file to get started.', 'Nada todavía. Suelta un archivo para empezar.', 'Rien pour l\'instant. Déposez un fichier pour commencer.', 'Noch nichts. Zieh eine Datei hierher, um zu starten.', 'Пока пусто. Перетащите файл, чтобы начать.', '还没有记录，拖入一个文件开始吧。'],
  ['Clear history', 'Borrar historial', 'Effacer l\'historique', 'Verlauf löschen', 'Очистить историю', '清除历史'],
  ['Filesmith works offline and never collects data.', 'Filesmith funciona sin conexión y nunca recoge datos.', 'Filesmith fonctionne hors ligne et ne collecte jamais de données.', 'Filesmith funktioniert offline und sammelt nie Daten.', 'Filesmith работает офлайн и никогда не собирает данные.', 'Filesmith 离线运行，从不收集数据。'],
  ['Where to save', 'Dónde guardar', 'Où enregistrer', 'Speicherort', 'Куда сохранять', '保存位置'],
  ['Next to the original file', 'Junto al archivo original', 'À côté du fichier original', 'Neben der Originaldatei', 'Рядом с исходным файлом', '原文件旁边'],
  ['Choose folder…', 'Elegir carpeta…', 'Choisir un dossier…', 'Ordner wählen…', 'Выбрать папку…', '选择文件夹…'],
  ['Use original folder', 'Usar la carpeta original', 'Utiliser le dossier d\'origine', 'Originalordner verwenden', 'Использовать исходную папку', '使用原文件夹'],
  ['Show the file when done', 'Mostrar el archivo al terminar', 'Afficher le fichier une fois terminé', 'Datei nach Abschluss zeigen', 'Показать файл после завершения', '完成后显示文件'],
  ['Opens the folder after a batch finishes.', 'Abre la carpeta al terminar un lote.', 'Ouvre le dossier à la fin d\'un lot.', 'Öffnet den Ordner, wenn ein Stapel fertig ist.', 'Открывает папку после завершения пакета.', '一批处理完成后打开文件夹。'],
  ['Appearance', 'Aspecto', 'Apparence', 'Erscheinungsbild', 'Оформление', '外观'],
  ['System', 'Sistema', 'Système', 'System', 'Системное', '跟随系统'],
  ['Dark', 'Oscuro', 'Sombre', 'Dunkel', 'Тёмное', '深色'],
  ['Light appearance', 'Claro', 'Clair', 'Hell', 'Светлое', '浅色'],
  ['Language', 'Idioma', 'Langue', 'Sprache', 'Язык', '语言'],
  ['Automatic', 'Automático', 'Automatique', 'Automatisch', 'Автоматически', '自动'],
  ['Check for updates', 'Buscar actualizaciones', 'Rechercher des mises à jour', 'Nach Updates suchen', 'Проверять обновления', '检查更新'],
  ['Once a day, Filesmith asks GitHub for the latest version number. Nothing about you or your files is sent.', 'Una vez al día, Filesmith pregunta a GitHub el número de la última versión. No se envía nada sobre ti ni tus archivos.', 'Une fois par jour, Filesmith demande à GitHub le numéro de la dernière version. Rien sur vous ou vos fichiers n\'est envoyé.', 'Einmal am Tag fragt Filesmith bei GitHub die neueste Versionsnummer ab. Über dich oder deine Dateien wird nichts gesendet.', 'Раз в день Filesmith узнаёт у GitHub номер последней версии. Ничего о вас и ваших файлах не отправляется.', 'Filesmith 每天向 GitHub 查询一次最新版本号，不会发送任何关于你或你文件的信息。'],
  ['Check now', 'Comprobar ahora', 'Vérifier maintenant', 'Jetzt prüfen', 'Проверить сейчас', '立即检查'],
  ["You're on the latest version.", 'Tienes la última versión.', 'Vous avez la dernière version.', 'Du hast die neueste Version.', 'У вас последняя версия.', '已是最新版本。'],
  ["Couldn't check for updates. Are you online?", 'No se pudo comprobar. ¿Tienes conexión?', 'Impossible de vérifier. Êtes-vous en ligne ?', 'Prüfung fehlgeschlagen. Bist du online?', 'Не удалось проверить. Есть интернет?', '无法检查更新，请确认已联网。'],
  ['Restart to update', 'Reiniciar para actualizar', 'Redémarrer pour mettre à jour', 'Neu starten zum Aktualisieren', 'Перезапустить для обновления', '重启以更新'],
  ['Download', 'Descargar', 'Télécharger', 'Herunterladen', 'Скачать', '下载'],
  ['Later', 'Más tarde', 'Plus tard', 'Später', 'Позже', '稍后'],
  ['About', 'Acerca de', 'À propos', 'Über', 'О программе', '关于'],
  ['Free and open source. Uses FFmpeg, pdf-lib and PDF.js.', 'Libre y de código abierto. Usa FFmpeg, pdf-lib y PDF.js.', 'Libre et open source. Utilise FFmpeg, pdf-lib et PDF.js.', 'Kostenlos und Open Source. Nutzt FFmpeg, pdf-lib und PDF.js.', 'Бесплатно и с открытым кодом. Использует FFmpeg, pdf-lib и PDF.js.', '免费开源，使用 FFmpeg、pdf-lib 和 PDF.js。'],
  ['Licences', 'Licencias', 'Licences', 'Lizenzen', 'Лицензии', '许可证'],
  ['Website', 'Sitio web', 'Site web', 'Website', 'Сайт', '网站'],
  ['Hollowbit makes tools with no ads, no accounts and no tracking. Found a bug or have an idea? Open an issue on GitHub.', 'Hollowbit crea herramientas sin anuncios, sin cuentas y sin rastreo. ¿Un fallo o una idea? Abre una incidencia en GitHub.', 'Hollowbit crée des outils sans pub, sans compte et sans pistage. Un bug ou une idée ? Ouvrez un ticket sur GitHub.', 'Hollowbit macht Werkzeuge ohne Werbung, Konten und Tracking. Fehler oder Idee? Eröffne ein Issue auf GitHub.', 'Hollowbit делает инструменты без рекламы, аккаунтов и слежки. Нашли ошибку или есть идея? Создайте issue на GitHub.', 'Hollowbit 的工具没有广告、无需账号、不做跟踪。发现问题或有想法？欢迎在 GitHub 上提交 issue。'],
  ['Filesmith is free and stays free: no ads, no limits, no account, no uploads. If it saved you from a converter website, a tip helps pay for the code-signing certificates that make the security warnings go away.', 'Filesmith es gratis y lo seguirá siendo: sin anuncios, sin límites, sin cuenta, sin subidas. Si te ahorró una web de conversión, una propina ayuda a pagar los certificados que eliminan los avisos de seguridad.', 'Filesmith est gratuit et le restera : sans pub, sans limite, sans compte, sans envoi. S\'il vous a évité un site de conversion, un pourboire aide à payer les certificats qui suppriment les avertissements.', 'Filesmith ist kostenlos und bleibt es: ohne Werbung, Limits, Konto oder Uploads. Wenn es dir eine Konverter-Website erspart hat, hilft ein Trinkgeld, die Zertifikate zu bezahlen, die die Warnungen entfernen.', 'Filesmith бесплатный и останется таким: без рекламы, ограничений, аккаунта и загрузок. Если он избавил вас от сайта-конвертера, чаевые помогут оплатить сертификаты, которые уберут предупреждения.', 'Filesmith 免费且将一直免费：没有广告、没有限制、无需账号、不上传。如果它帮你省去了转换网站的麻烦，打赏可以帮助支付消除安全警告所需的代码签名证书。'],
  ['Leave a tip on Ko-fi', 'Deja una propina en Ko-fi', 'Laisser un pourboire sur Ko-fi', 'Trinkgeld auf Ko-fi geben', 'Оставить чаевые на Ko-fi', '在 Ko-fi 上打赏'],
  ['Card, Apple Pay or PayPal. Takes about 20 seconds.', 'Tarjeta, Apple Pay o PayPal. Unos 20 segundos.', 'Carte, Apple Pay ou PayPal. Environ 20 secondes.', 'Karte, Apple Pay oder PayPal. Dauert etwa 20 Sekunden.', 'Карта, Apple Pay или PayPal. Около 20 секунд.', '支持银行卡、Apple Pay 或 PayPal，约 20 秒。'],
  ['Buy me a coffee', 'Invítame a un café', 'Offrez-moi un café', 'Spendier mir einen Kaffee', 'Угостить кофе', '请我喝杯咖啡'],
  ['Star it on GitHub', 'Dale una estrella en GitHub', 'Mettez une étoile sur GitHub', 'Auf GitHub mit Stern markieren', 'Поставьте звезду на GitHub', '在 GitHub 上点星'],
  ['Free, and it helps other people find Filesmith.', 'Es gratis y ayuda a que otros encuentren Filesmith.', 'C\'est gratuit et ça aide d\'autres personnes à trouver Filesmith.', 'Kostenlos und hilft anderen, Filesmith zu finden.', 'Бесплатно и помогает другим найти Filesmith.', '免费，还能帮助更多人发现 Filesmith。'],
  ['Open GitHub', 'Abrir GitHub', 'Ouvrir GitHub', 'GitHub öffnen', 'Открыть GitHub', '打开 GitHub'],
  ['Copy', 'Copiar', 'Copier', 'Kopieren', 'Копировать', '复制'],
  ['Address copied', 'Dirección copiada', 'Adresse copiée', 'Adresse kopiert', 'Адрес скопирован', '地址已复制'],

  // Errors
  ["Filesmith couldn't read this file. It may be damaged or in an unusual format.", 'Filesmith no pudo leer este archivo. Puede estar dañado o tener un formato poco común.', 'Filesmith n\'a pas pu lire ce fichier. Il est peut-être endommagé ou dans un format inhabituel.', 'Filesmith konnte die Datei nicht lesen. Sie ist vielleicht beschädigt oder hat ein ungewöhnliches Format.', 'Filesmith не смог прочитать файл. Возможно, он повреждён или в необычном формате.', 'Filesmith 无法读取此文件，它可能已损坏或格式不常见。'],
  ['The file was moved or deleted.', 'El archivo se movió o se eliminó.', 'Le fichier a été déplacé ou supprimé.', 'Die Datei wurde verschoben oder gelöscht.', 'Файл перемещён или удалён.', '文件已被移动或删除。'],
  ["Filesmith isn't allowed to save in that folder. Pick another output folder in Settings.", 'Filesmith no puede guardar en esa carpeta. Elige otra en Ajustes.', 'Filesmith ne peut pas enregistrer dans ce dossier. Choisissez-en un autre dans les Réglages.', 'Filesmith darf in diesem Ordner nicht speichern. Wähle in den Einstellungen einen anderen.', 'Filesmith не может сохранять в эту папку. Выберите другую в настройках.', 'Filesmith 无权保存到该文件夹，请在设置中选择其他文件夹。'],
  ['Your disk is full.', 'Tu disco está lleno.', 'Votre disque est plein.', 'Dein Speicher ist voll.', 'Диск заполнен.', '磁盘已满。'],
  ['This file has no video track.', 'Este archivo no tiene vídeo.', 'Ce fichier n\'a pas de piste vidéo.', 'Diese Datei hat keine Videospur.', 'В этом файле нет видео.', '此文件没有视频轨道。'],
  ['This video has no sound to extract.', 'Este vídeo no tiene sonido que extraer.', 'Cette vidéo n\'a pas de son à extraire.', 'Dieses Video hat keinen Ton.', 'В этом видео нет звука.', '此视频没有可提取的声音。'],
  ['This file has no sound.', 'Este archivo no tiene sonido.', 'Ce fichier n\'a pas de son.', 'Diese Datei hat keinen Ton.', 'В этом файле нет звука.', '此文件没有声音。'],
  ['That app is no longer installed.', 'Esa app ya no está instalada.', 'Cette app n\'est plus installée.', 'Diese App ist nicht mehr installiert.', 'Это приложение больше не установлено.', '该应用已不再安装。'],
  ['Cancelled', 'Cancelado', 'Annulé', 'Abgebrochen', 'Отменено', '已取消'],
];

// Whole sentences that contain bold words. Matched against an element's full HTML.
const H = [
  ['<b>JPG</b> works everywhere. <b>PNG</b> keeps transparency. <b>WebP</b> is smallest for websites.',
    '<b>JPG</b> funciona en todas partes. <b>PNG</b> mantiene la transparencia. <b>WebP</b> es el más ligero para webs.',
    '<b>JPG</b> marche partout. <b>PNG</b> garde la transparence. <b>WebP</b> est le plus léger pour le web.',
    '<b>JPG</b> funktioniert überall. <b>PNG</b> erhält Transparenz. <b>WebP</b> ist am kleinsten fürs Web.',
    '<b>JPG</b> открывается везде. <b>PNG</b> сохраняет прозрачность. <b>WebP</b> самый лёгкий для сайтов.',
    '<b>JPG</b> 到处都能用。<b>PNG</b> 保留透明度。<b>WebP</b> 最适合网页，体积最小。'],
  ['<b>WAV</b> and <b>FLAC</b> are lossless and big. <b>MP3</b> plays everywhere.',
    '<b>WAV</b> y <b>FLAC</b> no pierden calidad y ocupan mucho. <b>MP3</b> suena en todas partes.',
    '<b>WAV</b> et <b>FLAC</b> sont sans perte et lourds. <b>MP3</b> se lit partout.',
    '<b>WAV</b> und <b>FLAC</b> sind verlustfrei und groß. <b>MP3</b> läuft überall.',
    '<b>WAV</b> и <b>FLAC</b> без потерь и большие. <b>MP3</b> играет везде.',
    '<b>WAV</b> 和 <b>FLAC</b> 是无损格式，文件较大。<b>MP3</b> 到处都能播放。'],
  ['PNG screenshots shrink the most when saved as <b>JPG</b> or <b>WebP</b>.',
    'Las capturas PNG se reducen más al guardarlas como <b>JPG</b> o <b>WebP</b>.',
    'Les captures PNG rétrécissent le plus en <b>JPG</b> ou <b>WebP</b>.',
    'PNG-Screenshots werden als <b>JPG</b> oder <b>WebP</b> am kleinsten.',
    'Скриншоты PNG сильнее всего уменьшаются в <b>JPG</b> или <b>WebP</b>.',
    'PNG 截图保存为 <b>JPG</b> 或 <b>WebP</b> 时缩小最多。'],
  ['Uses high quality, so files may stay big. Use <b>Compress</b> to shrink them.',
    'Usa alta calidad, así que los archivos pueden seguir siendo grandes. Usa <b>Comprimir</b> para reducirlos.',
    'Qualité élevée, les fichiers peuvent rester lourds. Utilisez <b>Compresser</b> pour les réduire.',
    'Hohe Qualität, die Dateien können groß bleiben. Mit <b>Komprimieren</b> werden sie kleiner.',
    'Высокое качество, файлы могут остаться большими. Используйте <b>Сжать</b>, чтобы уменьшить.',
    '使用高画质，文件可能仍然较大。可用<b>压缩</b>来缩小。'],
  ['<b>Balanced</b> usually cuts phone videos by 60–80% and still looks great.',
    '<b>Equilibrada</b> suele reducir los vídeos del móvil un 60–80% y se siguen viendo genial.',
    '<b>Équilibrée</b> réduit souvent les vidéos de téléphone de 60 à 80 % tout en restant belle.',
    '<b>Ausgewogen</b> verkleinert Handyvideos meist um 60–80 % und sieht trotzdem super aus.',
    '<b>Сбалансированное</b> обычно уменьшает видео с телефона на 60–80% без видимых потерь.',
    '<b>均衡</b>通常能把手机视频缩小 60–80%，画面依然很好。'],
  ['<b>Light</b> cleans up the file and keeps everything selectable. For scans or photo-heavy PDFs, use <b>Strong</b>.',
    '<b>Ligera</b> limpia el archivo y mantiene todo seleccionable. Para escaneos o PDF con muchas fotos, usa <b>Fuerte</b>.',
    '<b>Légère</b> nettoie le fichier et garde tout sélectionnable. Pour les scans ou PDF riches en photos, utilisez <b>Forte</b>.',
    '<b>Leicht</b> räumt die Datei auf und alles bleibt auswählbar. Für Scans oder fotolastige PDFs nimm <b>Stark</b>.',
    '<b>Лёгкое</b> чистит файл и сохраняет выделяемый текст. Для сканов и PDF с фото используйте <b>Сильное</b>.',
    '<b>轻度</b>会清理文件并保留可选中的文字。扫描件或图片多的 PDF 请用<b>强力</b>。'],
  ["<b>Strong</b> turns each page into a picture. It's great for scanned documents, but you can't select the text afterwards.",
    '<b>Fuerte</b> convierte cada página en una imagen. Ideal para escaneos, pero después no podrás seleccionar el texto.',
    '<b>Forte</b> transforme chaque page en image. Idéal pour les scans, mais le texte n\'est plus sélectionnable.',
    '<b>Stark</b> macht aus jeder Seite ein Bild. Ideal für Scans, aber der Text ist danach nicht mehr auswählbar.',
    '<b>Сильное</b> превращает каждую страницу в картинку. Отлично для сканов, но текст потом не выделить.',
    '<b>强力</b>会把每页变成图片，适合扫描件，但之后无法选中文字。'],
  ['Example: <b>1-3, 4-8</b> makes two files.', 'Ejemplo: <b>1-3, 4-8</b> crea dos archivos.', 'Exemple : <b>1-3, 4-8</b> crée deux fichiers.', 'Beispiel: <b>1-3, 4-8</b> ergibt zwei Dateien.', 'Пример: <b>1-3, 4-8</b> даёт два файла.', '例如：<b>1-3, 4-8</b> 会生成两个文件。'],
  ['Example: <b>1, 3, 5-7</b> keeps those pages in one new file.', 'Ejemplo: <b>1, 3, 5-7</b> guarda esas páginas en un archivo nuevo.', 'Exemple : <b>1, 3, 5-7</b> garde ces pages dans un nouveau fichier.', 'Beispiel: <b>1, 3, 5-7</b> behält diese Seiten in einer neuen Datei.', 'Пример: <b>1, 3, 5-7</b> сохранит эти страницы в новый файл.', '例如：<b>1, 3, 5-7</b> 会把这些页面保存到一个新文件。'],
  ['<b>Now click on the page</b> where it should go.', '<b>Ahora haz clic en la página</b> donde debe ir.', '<b>Cliquez maintenant sur la page</b> à l\'endroit voulu.', '<b>Klick jetzt auf die Seite</b>, wo es hin soll.', '<b>Теперь нажмите на странице</b> там, где оно должно быть.', '<b>现在点击页面</b>上要放置的位置。'],
];

// Phrases with numbers or names in them. $1, $2 insert the captured parts; @1 inserts a translated part.
const P = [
  [/^(\d+) files? done · saved (.+)$/, ['Hecho: $1 · ahorrado $2', 'Terminé : $1 · gain $2', 'Fertig: $1 · gespart $2', 'Готово: $1 · сэкономлено $2', '完成 $1 个 · 节省 $2']],
  [/^(\d+) files? done$/, ['Hecho: $1', 'Terminé : $1', 'Fertig: $1', 'Готово: $1', '完成 $1 个']],
  [/^(\d+) files? didn't work\. See the message next to each one\.$/, ['Fallaron: $1. Mira el mensaje junto a cada uno.', 'Échecs : $1. Voir le message à côté de chacun.', 'Fehlgeschlagen: $1. Siehe die Meldung bei jeder Datei.', 'Ошибок: $1. Смотрите сообщение у каждого файла.', '$1 个失败，请查看每个文件旁的提示。']],
  [/^Filesmith can't open (.+)\.$/, ['Filesmith no puede abrir $1.', 'Filesmith ne peut pas ouvrir $1.', 'Filesmith kann $1 nicht öffnen.', 'Filesmith не может открыть $1.', 'Filesmith 无法打开 $1。']],
  [/^Also added (.+)\.$/, ['También añadido: $1.', 'Aussi ajouté : $1.', 'Ebenfalls hinzugefügt: $1.', 'Также добавлено: $1.', '另外添加了：$1。']],
  [/^Already under (\d+) MB$/, ['Ya pesa menos de $1 MB', 'Déjà sous $1 Mo', 'Schon unter $1 MB', 'Уже меньше $1 МБ', '已小于 $1 MB']],
  [/^(\d+) min ago$/, ['hace $1 min', 'il y a $1 min', 'vor $1 Min.', '$1 мин назад', '$1 分钟前']],
  [/^(\d+) h ago$/, ['hace $1 h', 'il y a $1 h', 'vor $1 Std.', '$1 ч назад', '$1 小时前']],
  [/^(Merge|Compress) (\d+) PDFs$/, ['@1 PDFs ($2)', '@1 PDFs ($2)', '@1 PDFs ($2)', '@1 PDFs ($2)', '@1 PDFs（$2）'], (m) => [`${m[1]} PDFs`]],
  [/^Make PDF from (\d+) images$/, ['Crear PDF ($1)', 'Créer le PDF ($1)', 'PDF erstellen ($1)', 'Создать PDF ($1)', '生成 PDF（$1）']],
  [/^(.+) (\d+) files$/, ['@1 ($2)', '@1 ($2)', '@1 ($2)', '@1 ($2)', '@1（$2）']],
  [/^(\d+) files?$/, ['Archivos: $1', 'Fichiers : $1', 'Dateien: $1', 'Файлов: $1', '$1 个文件']],
  [/^(\d+) pages?$/, ['Páginas: $1', 'Pages : $1', 'Seiten: $1', 'Страниц: $1', '$1 页']],
  [/^(\d+) files saved$/, ['Archivos guardados: $1', 'Fichiers enregistrés : $1', 'Gespeicherte Dateien: $1', 'Сохранено файлов: $1', '已保存 $1 个文件']],
  [/^Next to (.+)$/, ['Junto a $1', 'À côté de $1', 'Neben $1', 'Рядом с $1', '位于 $1 旁边']],
  [/^Adding (.+)…$/, ['Añadiendo $1…', 'Ajout de $1…', '$1 wird hinzugefügt…', 'Добавление $1…', '正在添加 $1…']],
  [/^Compressing (.+)…$/, ['Comprimiendo $1…', 'Compression de $1…', '$1 wird komprimiert…', 'Сжатие $1…', '正在压缩 $1…']],
  [/^Making file (\d+) of (\d+)…$/, ['Archivo $1 de $2…', 'Fichier $1 sur $2…', 'Datei $1 von $2…', 'Файл $1 из $2…', '正在生成第 $1/$2 个文件…']],
  [/^Page (\d+) of (\d+)…$/, ['Página $1 de $2…', 'Page $1 sur $2…', 'Seite $1 von $2…', 'Страница $1 из $2…', '第 $1/$2 页…']],
  [/^Image (\d+) of (\d+)…$/, ['Imagen $1 de $2…', 'Image $1 sur $2…', 'Bild $1 von $2…', 'Изображение $1 из $2…', '第 $1/$2 张图片…']],
  [/^(.+) is password-protected\. Remove the password first\.$/, ['$1 tiene contraseña. Quítala primero.', '$1 est protégé par mot de passe. Retirez-le d\'abord.', '$1 ist passwortgeschützt. Entferne zuerst das Passwort.', '$1 защищён паролем. Сначала снимите пароль.', '$1 设有密码，请先移除密码。']],
  [/^(.+) looks damaged and can't be opened\.$/, ['$1 parece dañado y no se puede abrir.', '$1 semble endommagé et ne peut pas être ouvert.', '$1 scheint beschädigt und lässt sich nicht öffnen.', '$1 повреждён и не открывается.', '$1 似乎已损坏，无法打开。']],
  [/^"(.+)" isn't a page range\. Use something like 1-3, 5\.$/, ['«$1» no es un rango. Usa algo como 1-3, 5.', '« $1 » n\'est pas une plage. Utilisez par exemple 1-3, 5.', '„$1“ ist kein Seitenbereich. Nutze z. B. 1-3, 5.', '«$1» — не диапазон. Пример: 1-3, 5.', '“$1”不是有效范围，请使用类似 1-3, 5 的格式。']],
  [/^"(.+)" is outside 1–(\d+)\.$/, ['«$1» está fuera de 1–$2.', '« $1 » est hors de 1–$2.', '„$1“ liegt außerhalb von 1–$2.', '«$1» вне диапазона 1–$2.', '“$1”超出了 1–$2 的范围。']],
  [/^Leave a tip on (.+)$/, ['Deja una propina en $1', 'Laisser un pourboire sur $1', 'Trinkgeld auf $1 geben', 'Оставить чаевые на $1', '在 $1 上打赏']],
  [/^Version (.+) is ready\.$/, ['La versión $1 está lista.', 'La version $1 est prête.', 'Version $1 ist bereit.', 'Версия $1 готова.', '$1 版本已就绪。']],
  [/^Version (.+) is available\.$/, ['Hay una versión $1 disponible.', 'La version $1 est disponible.', 'Version $1 ist verfügbar.', 'Доступна версия $1.', '有新版本 $1 可用。']],
];

// Whole-element patterns (HTML with bold parts).
const HP = [
  [/^<b>([\d,.\s]+)<\/b> files made · <b>(.+?)<\/b> saved · <b>0 bytes<\/b> uploaded$/, ['<b>$1</b> archivos · <b>$2</b> ahorrados · <b>0 bytes</b> subidos', '<b>$1</b> fichiers · <b>$2</b> gagnés · <b>0 octet</b> envoyé', '<b>$1</b> Dateien · <b>$2</b> gespart · <b>0 Bytes</b> hochgeladen', 'Файлов: <b>$1</b> · сэкономлено <b>$2</b> · загружено <b>0 байт</b>', '已生成 <b>$1</b> 个文件 · 节省 <b>$2</b> · 上传 <b>0 字节</b>']],
  [/^<b>(\d+)<\/b> files · <b>(\d+)<\/b> pages in total$/, ['<b>$1</b> archivos · <b>$2</b> páginas en total', '<b>$1</b> fichiers · <b>$2</b> pages au total', '<b>$1</b> Dateien · <b>$2</b> Seiten insgesamt', 'Файлов: <b>$1</b> · всего страниц: <b>$2</b>', '<b>$1</b> 个文件 · 共 <b>$2</b> 页']],
  [/^<b>(\d+)<\/b> pages?(?: · (\d+) deleted)?$/, ['Páginas: <b>$1</b>', 'Pages : <b>$1</b>', 'Seiten: <b>$1</b>', 'Страниц: <b>$1</b>', '<b>$1</b> 页']],
  [/^Working on <b>(.+?)<\/b>(?: \((\d+) pages\))?\.$/, ['Trabajando en <b>$1</b>.', 'Fichier : <b>$1</b>.', 'Datei: <b>$1</b>.', 'Файл: <b>$1</b>.', '正在处理 <b>$1</b>。']],
  [/^Saved to <span class="mono">(.+?)<\/span> · originals are never changed$/, ['Se guarda en <span class="mono">$1</span> · los originales nunca cambian', 'Enregistré dans <span class="mono">$1</span> · les originaux ne changent jamais', 'Gespeichert in <span class="mono">$1</span> · Originale bleiben unverändert', 'Сохраняется в <span class="mono">$1</span> · оригиналы не меняются', '保存到 <span class="mono">$1</span> · 原文件永不改动']],
  [/^Scale to <b id="pct-v">(\d+)%<\/b>$/, ['Escalar al <b id="pct-v">$1%</b>', 'Mettre à <b id="pct-v">$1 %</b>', 'Skalieren auf <b id="pct-v">$1 %</b>', 'Масштаб: <b id="pct-v">$1%</b>', '缩放到 <b id="pct-v">$1%</b>']],
];

const QW = { best: ['máxima', 'maximale', 'beste', 'лучшее', '最佳'], great: ['muy buena', 'très bonne', 'sehr gut', 'отличное', '很好'], good: ['buena', 'bonne', 'gut', 'хорошее', '良好'], smallest: ['mínima', 'minimale', 'kleinste', 'минимальное', '最小'] };

let lang = 'en';
let col = -1;
const dict = new Map();
const html = new Map();
const norm = (s) => s.replace(/\s+/g, ' ').trim();

export function pickLang(setting) {
  if (setting && setting !== 'auto' && LANGS[setting]) return setting;
  const nav = (navigator.languages || [navigator.language || 'en']).map((l) => l.toLowerCase().slice(0, 2));
  return nav.find((l) => LANGS[l]) || 'en';
}
export const currentLang = () => lang;

export function setLang(code) {
  lang = LANGS[code] ? code : 'en';
  col = ORDER.indexOf(lang);
  dict.clear(); html.clear();
  if (col >= 0) {
    for (const row of T) dict.set(row[0], row[col + 1]);
    for (const row of H) html.set(norm(row[0]), row[col + 1]);
  }
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : lang;
}

const fill = (tpl, m, extra) => tpl.replace(/@(\d)/g, (_, i) => tr((extra && extra[i - 1]) || m[i])).replace(/\$(\d)/g, (_, i) => m[i] ?? '');

// Translate one English string (used by code, e.g. search, and by the DOM pass).
export function tr(s) {
  if (col < 0 || !s) return s;
  const key = norm(s);
  if (dict.has(key)) return dict.get(key);
  for (const [re, tpls, extra] of P) {
    const m = key.match(re);
    if (m) return fill(tpls[col], m, extra && extra(m));
  }
  // "a · b · c" pieces each translate on their own (counts, sizes, hints).
  if (key.includes(' · ')) {
    const parts = key.split(' · ');
    const out = parts.map((p) => {
      const q = p.match(/^(\d+) · (best|great|good|smallest)$/);
      return q ? p : tr(p);
    });
    if (out.some((x, i) => x !== parts[i])) return out.join(' · ');
  }
  const q = key.match(/^(\d+) · (best|great|good|smallest)$/);
  if (q) return `${q[1]} · ${QW[q[2]][col]}`;
  if (key === 'click a file to choose it') return ['haz clic en un archivo para elegirlo', 'cliquez sur un fichier pour le choisir', 'Datei anklicken, um sie zu wählen', 'нажмите на файл, чтобы выбрать', '点击文件来选择'][col];
  if (key === 'drag to change the order') return ['arrastra para cambiar el orden', 'faites glisser pour changer l\'ordre', 'zum Umsortieren ziehen', 'перетащите, чтобы изменить порядок', '拖动可调整顺序'][col];
  if (key === 'click one to pick it') return ['haz clic en uno para elegirlo', 'cliquez sur un fichier pour le choisir', 'zum Auswählen anklicken', 'нажмите, чтобы выбрать', '点击选择'][col];
  return s;
}

const done = new WeakSet();
const selfSet = new WeakSet(); // text this code just changed; its own mutation is ignored
function translateNode(root) {
  if (col < 0) return;
  const walk = (n) => {
    if (n.nodeType === 3) {
      if (done.has(n)) return;
      const raw = n.nodeValue;
      if (!/[A-Za-z]/.test(raw)) return;
      const t = tr(raw);
      if (t !== raw && t !== norm(raw)) {
        const lead = raw.match(/^\s*/)[0]; const trail = raw.match(/\s*$/)[0];
        const next = lead + t + trail;
        if (next !== raw) { selfSet.add(n); n.nodeValue = next; }
      }
      done.add(n);
      return;
    }
    if (n.nodeType !== 1) return;
    const tag = n.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'svg' || tag === 'INPUT' && n.type !== 'text' || n.classList.contains('name') || n.hasAttribute('data-no-i18n')) return;
    for (const a of ['placeholder', 'title', 'aria-label']) {
      const v = n.getAttribute(a);
      if (v && /[A-Za-z]/.test(v)) { const t = tr(v); if (t !== v) n.setAttribute(a, t); }
    }
    if (!done.has(n) && n.childElementCount && n.childElementCount < 8) {
      const h = norm(n.innerHTML);
      if (html.has(h)) { n.innerHTML = html.get(h); done.add(n); return; }
      for (const [re, tpls] of HP) { const m = h.match(re); if (m) { n.innerHTML = fill(tpls[col], m); done.add(n); return; } }
    }
    n.childNodes.forEach(walk);
  };
  walk(root);
}

let observer = null;
export function startTranslating() {
  if (observer) observer.disconnect();
  if (col < 0) return;
  translateNode(document.body);
  observer = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'characterData') {
        if (selfSet.has(m.target)) { selfSet.delete(m.target); continue; }
        done.delete(m.target); translateNode(m.target);
      }
      else if (m.type === 'attributes') translateNode(m.target);
      else m.addedNodes.forEach((n) => translateNode(n));
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label'] });
}
