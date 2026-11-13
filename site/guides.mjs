// Search guides: plain answers to the file questions people actually search for.
// Each one gives the answer first, then steps (marked up as HowTo), then honest alternatives and an FAQ.
export const UPDATED = '2026-11-13';

export const GUIDES = [
  {
    slug: 'compress-video-for-discord',
    title: 'How to compress a video for Discord (under 10 MB, free)',
    desc: 'Shrink any video to fit Discord\'s 10 MB upload limit without Nitro and without uploading it to a website. Free, offline, works on Windows and Mac.',
    h1: 'How to compress a video for Discord',
    answer: 'Discord\'s free upload limit is 10 MB per file. To fit a longer or higher-quality video under it, re-encode it at a bitrate worked out from its length. Fileshaper does that for you: choose "10 MB", and every video lands just under the limit, on your own computer.',
    tool: 'video',
    steps: [
      ['Download Fileshaper', 'Install the free app for Windows or Mac from the download page.'],
      ['Drop your video on the window', 'MP4, MOV, MKV, WEBM and iPhone videos all work. You can add several at once.'],
      ['Choose "10 MB · Discord"', 'Under Compress, pick the 10 MB size limit. Pick 50 MB instead if you have Nitro Basic.'],
      ['Click Compress', 'Fileshaper encodes each video twice so it lands just under the limit, and saves the result next to the original.'],
      ['Upload it to Discord', 'Drag the new file (it ends in "-10MB.mp4") into your Discord chat.'],
    ],
    sections: [
      ['Why "under 10 MB" needs two passes', 'A file\'s size is its bitrate multiplied by its length. Fileshaper measures the length, works out the highest bitrate that fits, then encodes twice: the first pass studies the video, the second spends the data where it matters most. Long videos automatically drop to 720p or 480p so they still look clean instead of blocky.'],
      ['How long can a 10 MB video be?', 'Roughly: about 1 minute at 1080p, 2 to 3 minutes at 720p, and 5 minutes or more at 480p. Fast-moving gameplay needs more data than a talking head, so it looks best when the clip is short.'],
      ['Other ways to do it', 'Discord Nitro raises the limit. HandBrake is free and powerful but has hundreds of settings and no "fit under 10 MB" option. Online compressors work, but you upload your video to a stranger\'s server, and most limit file size or add a watermark.'],
    ],
    faq: [
      ['What is Discord\'s file size limit?', 'For free accounts it is 10 MB per file at the time of writing. Nitro subscriptions raise it.'],
      ['Will the video look worse?', 'A little, because the same video has to fit in fewer bytes. Short clips under a minute usually look almost identical. Trimming the video first helps more than anything else.'],
      ['Is it safe to use an online compressor?', 'It works, but your video is uploaded to someone else\'s server. Fileshaper never uploads anything.'],
    ],
  },
  {
    slug: 'heic-to-jpg-windows',
    title: 'How to open HEIC photos on Windows and convert them to JPG',
    desc: 'iPhone photos are saved as HEIC, which many Windows apps can\'t open. Convert HEIC to JPG in bulk, free and offline, without uploading your photos.',
    h1: 'How to open HEIC photos on Windows (and convert them to JPG)',
    answer: 'iPhones save photos as HEIC to save space, but many Windows apps, websites and printers only accept JPG. The quickest fix is to convert them: drop the HEIC files on Fileshaper, choose JPG, and it converts hundreds at once on your own computer.',
    tool: 'images',
    steps: [
      ['Download Fileshaper', 'Install the free app for Windows (it also runs on Mac).'],
      ['Drop your HEIC photos on the window', 'Select a whole folder\'s worth and drag it in.'],
      ['Choose JPG', 'Under Images, Convert, pick JPG. The quality slider is set to a level that looks the same as the original.'],
      ['Click Convert', 'Each photo is saved as a JPG next to the original HEIC. The originals are never changed.'],
    ],
    sections: [
      ['Why iPhones use HEIC', 'HEIC (High Efficiency Image Container) stores the same photo in roughly half the space of a JPG. Apple made it the default camera format in 2017. The catch is compatibility: plenty of software still expects JPG.'],
      ['Stop your iPhone saving HEIC', 'On the iPhone, open Settings, Camera, Formats, and choose "Most Compatible". New photos are then saved as JPG. Photos you already took stay HEIC, so you still need to convert those.'],
      ['Other ways to do it', 'Windows can open HEIC if you install Microsoft\'s HEIF and HEVC extensions, but that doesn\'t help with websites that reject HEIC. Online converters work, but they mean uploading your personal photos.'],
    ],
    faq: [
      ['Does converting HEIC to JPG lose quality?', 'Very slightly, because JPG compresses differently. At the default quality the difference isn\'t visible.'],
      ['Can I convert many HEIC files at once?', 'Yes. Drop hundreds of photos in one go and Fileshaper converts them all.'],
      ['Are my photos uploaded anywhere?', 'No. Fileshaper converts them on your computer and works with the Wi-Fi off.'],
    ],
  },
  {
    slug: 'sign-pdf-without-uploading',
    title: 'How to sign a PDF without uploading it (free, offline)',
    desc: 'Add a drawn or typed signature and the date to any PDF without sending your contract to a website. Free and offline on Windows and Mac.',
    h1: 'How to sign a PDF without uploading it',
    answer: 'You can sign a PDF entirely on your own computer: open it in Fileshaper, draw or type your signature, drag it onto the signature line, add the date, and save. The signed copy is a new file; the original isn\'t changed and nothing is uploaded.',
    tool: 'pdf',
    steps: [
      ['Download Fileshaper', 'Install the free app for Windows or Mac.'],
      ['Open PDF, then Sign & fill', 'Drop the PDF on the window and choose Sign & fill.'],
      ['Create your signature', 'Draw it with your mouse or trackpad, or type your name in a handwriting style. It\'s saved on your computer for next time.'],
      ['Place it', 'Click where the signature goes, then drag the corner to resize it. Add your name or today\'s date the same way.'],
      ['Save the signed PDF', 'Fileshaper saves a new file ending in "-signed.pdf" next to the original.'],
    ],
    sections: [
      ['Why not use an online PDF signer?', 'Contracts, leases and forms are some of the most private documents people have. Online signers upload them to their servers, and many require an account or limit free use. Fileshaper does the same job locally.'],
      ['Is this a legal electronic signature?', 'Fileshaper places an image of your signature on the page, the same as signing by hand and scanning. That is accepted for most everyday forms and agreements. Some legal documents require a certified digital signature, which is a different technology.'],
    ],
    faq: [
      ['Can I add the date and my name too?', 'Yes. Use "Add today\'s date" and "Add text", then drag them into place.'],
      ['Does it change my original PDF?', 'No. The signed version is saved as a new file.'],
      ['Does it work on scanned PDFs?', 'Yes. You can place a signature on any page, scanned or not.'],
    ],
  },
  {
    slug: 'merge-pdf-offline',
    title: 'How to merge PDF files offline, for free',
    desc: 'Combine several PDFs into one in any order, without uploading them. Free and offline on Windows and Mac, with no page limit.',
    h1: 'How to merge PDF files offline',
    answer: 'To combine PDFs without uploading them, drop them on Fileshaper, drag them into the order you want, and click Merge. You get one PDF with every page, made on your own computer.',
    tool: 'pdf',
    steps: [
      ['Download Fileshaper', 'Install the free app for Windows or Mac.'],
      ['Drop your PDFs on the window', 'Open the PDF tool and choose Merge.'],
      ['Put them in order', 'Drag files up or down. They\'re combined top to bottom.'],
      ['Click Merge', 'The combined file is saved as a new PDF ending in "-merged.pdf".'],
    ],
    sections: [
      ['Fix the pages after merging', 'Use Organize pages to drag pages into a different order, rotate sideways scans, or delete blank pages, then save a new PDF.'],
      ['Other ways to do it', 'On a Mac, Preview can merge PDFs by dragging thumbnails between windows, which is fiddly for many files. Online tools work but upload your documents and often limit free use.'],
    ],
    faq: [
      ['Is there a limit on files or pages?', 'No. Fileshaper has no limits.'],
      ['Can I merge password-protected PDFs?', 'Remove the password first; Fileshaper will tell you which file is protected.'],
      ['Will the text still be selectable?', 'Yes. Merging copies pages exactly; nothing is turned into an image.'],
    ],
  },
  {
    slug: 'video-to-gif',
    title: 'How to make a GIF from a video (free, no watermark)',
    desc: 'Turn any part of a video into a GIF: pick the moment, choose the size and smoothness, done. Free, offline, no watermark.',
    h1: 'How to make a GIF from a video',
    answer: 'Open the video in Fileshaper, choose Make GIF, drag the two handles to the moment you want (2 to 6 seconds works best), pick a width and smoothness, and save. The GIF is made on your computer with no watermark.',
    tool: 'video',
    steps: [
      ['Download Fileshaper', 'Install the free app for Windows or Mac.'],
      ['Drop the video and choose Make GIF', 'MP4, MOV, MKV and WEBM all work.'],
      ['Pick the moment', 'Drag the start and end handles under the preview, then play the selection to check it.'],
      ['Choose size and smoothness', '480 px wide at 15 frames per second is a good balance. Smaller and slower makes a lighter file.'],
      ['Click Make GIF', 'The GIF is saved next to the video.'],
    ],
    sections: [
      ['Why GIFs get so big', 'A GIF stores every frame as a separate image with at most 256 colours. A few seconds is fine; 15 seconds or more quickly becomes many megabytes. Fileshaper builds a custom colour palette for each clip, which keeps colours accurate and files smaller.'],
    ],
    faq: [
      ['How long should a GIF be?', '2 to 6 seconds. Longer clips are better shared as a short MP4.'],
      ['Is there a watermark?', 'No, never.'],
      ['Can I make a GIF for Discord?', 'Yes. Keep it short and around 480 px wide so it stays well under the upload limit.'],
    ],
  },
  {
    slug: 'compress-pdf-for-email',
    title: 'How to compress a PDF for email or upload (free, offline)',
    desc: 'Make a PDF small enough to email or upload to a school or job portal, without sending it to a website. Free and offline on Windows and Mac.',
    h1: 'How to compress a PDF for email or upload',
    answer: 'Drop the PDF on Fileshaper, choose Compress, and pick Light (keeps text selectable) or Strong (best for scans and photo-heavy files). The smaller copy is saved next to the original, without uploading anything.',
    tool: 'pdf',
    steps: [
      ['Download Fileshaper', 'Install the free app for Windows or Mac.'],
      ['Open PDF, then Compress', 'Drop one or more PDFs on the window.'],
      ['Choose Light or Strong', 'Light cleans up the file and keeps everything selectable. Strong turns each page into a compressed image, which shrinks scans a lot.'],
      ['Click Compress', 'Fileshaper only saves a copy if it\'s actually smaller.'],
    ],
    sections: [
      ['Which setting to use', 'If the PDF came from a scanner or a phone camera, use Strong: those files are big because each page is already a photo. If it\'s a document exported from Word or Google Docs, try Light first so the text stays selectable.'],
      ['Common size limits', 'Many email services cap attachments at around 20 to 25 MB, and many school and job portals accept only a few megabytes per file. Check the limit where you\'re uploading.'],
    ],
    faq: [
      ['Will the text still be searchable?', 'With Light, yes. With Strong, pages become images, so the text can\'t be selected afterwards.'],
      ['Can I compress several PDFs at once?', 'Yes. Drop them all in and compress them in one go.'],
      ['Is my document uploaded?', 'No. Fileshaper works offline.'],
    ],
  },
  {
    slug: 'mov-to-mp4',
    title: 'How to convert MOV to MP4 for free (Mac and Windows, offline)',
    desc: 'Turn iPhone and QuickTime MOV videos into MP4 files that play everywhere, without uploading them to a website. Free, offline, Windows and Mac.',
    h1: 'How to convert MOV to MP4',
    answer: 'MOV is Apple\'s video format. It plays fine on a Mac and iPhone, but some Windows apps, Android phones, websites and editors refuse it. Converting it to MP4 makes a file that plays almost everywhere. Fileshaper does it in one click, on your own computer, with no upload and no watermark.',
    tool: 'video',
    steps: [
      ['Download Fileshaper', 'Install the free app for Windows or Mac from the download page.'],
      ['Drop your MOV files on the window', 'iPhone videos, screen recordings and QuickTime exports all work. You can add several at once.'],
      ['Choose Convert to MP4', 'Under Video, pick Convert to MP4.'],
      ['Click Convert', 'The MP4 is saved next to the original, which is left untouched.'],
    ],
    sections: [
      ['Why MOV files sometimes won\'t play', 'MOV is a container made by Apple. Windows Media Player, many Android phones, some upload forms and older editors only accept MP4. Newer iPhones also record in HEVC, which some devices can\'t decode at all. An MP4 with H.264 video is the safest format to share.'],
      ['Does converting lose quality?', 'Re-encoding always changes the video slightly, but at normal settings you won\'t see the difference. If you also need the file smaller, use Compress instead and pick a size such as 25 MB.'],
      ['Other ways to do it', 'On a Mac, QuickTime Player\'s File, Export As makes a MOV, not an MP4. VLC and HandBrake are free and can convert, with many more settings to work through. Online converters work too, but they upload your video to someone else\'s server and often limit file size.'],
    ],
    faq: [
      ['Is MP4 better than MOV?', 'Not better, just more widely supported. For sharing and uploading, MP4 is the safer choice.'],
      ['Can I convert several MOV files at once?', 'Yes. Drop them all on Fileshaper together and convert them in one go.'],
      ['Does Fileshaper upload my video?', 'No. Everything happens on your computer. Fileshaper never uploads your files.'],
    ],
  },
  {
    slug: 'compress-video-for-email',
    title: 'How to compress a video for email or WhatsApp (free, offline)',
    desc: 'Shrink a video so it fits as an email attachment or sends quickly in a chat, without uploading it anywhere. Free, offline, Windows and Mac.',
    h1: 'How to compress a video for email or WhatsApp',
    answer: 'Most email services cap attachments at about 20 to 25 MB (Gmail allows 25 MB), and chat apps squeeze big videos hard when you send them. Compressing the video yourself to a set size keeps it sharper and makes sure it goes through. Fileshaper lets you pick the size, such as 16 or 25 MB, and does the rest on your computer.',
    tool: 'video',
    steps: [
      ['Download Fileshaper', 'Install the free app for Windows or Mac from the download page.'],
      ['Drop your video on the window', 'MP4, MOV, MKV, WEBM and iPhone videos all work.'],
      ['Pick a size under Compress', 'Choose 25 MB for most email, or 16 MB to keep it small for chats.'],
      ['Click Compress and attach the new file', 'The smaller copy is saved next to the original, with the size in its name.'],
    ],
    sections: [
      ['How small can a video get?', 'A file\'s size is its bitrate multiplied by its length, so short clips stay sharp and long ones have to drop resolution. As a rough guide, 25 MB holds about 2 minutes at 1080p or 5 minutes at 720p. Trimming the video first helps more than anything else.'],
      ['When to share a link instead', 'For long videos, a shared link from iCloud Drive, Google Drive or OneDrive is better than squeezing them into an attachment. Gmail switches large attachments to a Drive link for you.'],
      ['Other ways to do it', 'HandBrake is free and powerful but has no "fit under 25 MB" option. Online compressors work, but you upload your video to a stranger\'s server, and many add a watermark or limit the size.'],
    ],
    faq: [
      ['What is the email attachment limit?', 'Gmail allows 25 MB per email. Most other services allow about 20 to 25 MB.'],
      ['Will the video look worse?', 'A little, because it has to fit in fewer bytes. Short clips usually look almost the same.'],
      ['Is it private?', 'Yes. Fileshaper works offline and never uploads your video.'],
    ],
  },

];
