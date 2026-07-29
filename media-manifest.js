(() => {
  const local = (file, sourceName, sourceTitle, extra = {}) => ({
    status: 'verified_exact',
    file,
    kind: /\.mp4$/i.test(file) ? 'video' : 'image',
    sourceName,
    sourceTitle,
    exactVariant: true,
    offline: true,
    verifiedAt: '2026-07-29',
    ...extra
  });

  window.EXERCISE_MEDIA = {
    'wall-slide': local('media/wall-slide.gif', 'PTProgress', 'Forearm Wall Slide'),
    'cable-external-rotation': local('media/cable-external-rotation.gif', 'Exercise Gym GIFs DB', 'Cable External Shoulder Rotation'),
    'cable-serratus-punch': local('media/cable-serratus-punch.svg', 'Amino', 'راهنمای متحرک آفلاین پانچ سراتوس سیمکش'),
    'incline-dumbbell-press': local('media/incline-dumbbell-press.webp', 'فیتامین', 'پرس بالاسینه دمبل'),
    'lying-machine-chest-press': local('media/lying-machine-chest-press.webp', 'فیتامین', 'پرس سینه دستگاه خوابیده'),
    'pec-deck-fly': local('media/pec-deck-fly.webp', 'فیتامین', 'فلای سینه دستگاه'),
    'high-to-low-cable-crossover': local('media/high-to-low-cable-crossover.webp', 'فیتامین', 'کراس‌اور سیمکش از بالا به پایین'),
    'chest-supported-h-row': local('media/chest-supported-h-row.webp', 'فیتامین', 'زیربغل دستگاه H با تکیه‌گاه سینه'),
    'machine-triceps-dip': local('media/machine-triceps-dip.webp', 'فیتامین', 'دیپ پشت‌بازو دستگاه'),
    'overhead-rope-triceps-extension': local('media/overhead-rope-triceps-extension.webp', 'فیتامین', 'پشت‌بازو طناب بالای سر'),
    'cable-pallof-press': local('media/cable-pallof-press.webp', 'بدن‌خوبا', 'پالوف پرس سیمکش'),
    'seated-calf-raise': local('media/seated-calf-raise.webp', 'فیتامین', 'ساق نشسته دستگاه'),

    'machine-shoulder-press': local('media/machine-shoulder-press.webp', 'فیتامین', 'پرس سرشانه دستگاه'),
    'machine-lateral-raise': local('media/machine-lateral-raise.webp', 'بدن‌خوبا', 'نشر جانب دستگاه'),
    'incline-machine-chest-press': local('media/incline-machine-chest-press.webp', 'فیتامین', 'پرس بالاسینه دستگاه'),
    'seated-leg-press': local('media/leg-press.webp', 'فیتامین', 'پرس پا دستگاه'),
    'leg-extension': local('media/leg-extension.webp', 'فیتامین', 'جلوپا دستگاه'),
    'dumbbell-hammer-curl': local('media/dumbbell-hammer-curl.webp', 'فیتامین', 'جلو بازو چکشی دمبل'),
    'cable-reverse-wrist-curl': local('media/cable-reverse-wrist-curl.gif', 'Exercise Gym GIFs DB', 'Cable Reverse Wrist Curl'),
    'dumbbell-heavy-hold': local('media/dumbbell-heavy-hold.mp4', 'Motra', 'Dumbbell Static Hold'),
    'reverse-crunch': local('media/reverse-crunch.webp', 'فیتامین', 'ریورس کرانچ'),

    'hip-hinge-drill': local('media/hip-hinge-drill.gif', 'JustZon', 'Hip Hinge'),
    'dumbbell-rdl': local('media/dumbbell-romanian-deadlift.webp', 'بدن‌خوبا', 'ددلیفت رومانیایی دمبل'),
    'hack-squat': local('media/hack-or-pendulum-squat.webp', 'فیتامین', 'هاک اسکوات دستگاه'),
    'bulgarian-split-squat': local('media/bulgarian-split-squat.webp', 'فیتامین', 'اسپلیت‌اسکوات بلغاری', { alternativeOnly: true }),
    'lying-leg-curl': local('media/lying-leg-curl.webp', 'فیتامین', 'پشت‌پا دستگاه خوابیده'),
    'single-arm-overhead-cable-triceps': local('media/single-arm-overhead-cable-triceps-extension.webp', 'فیتامین', 'پشت‌بازو سیمکش تک‌دست بالای سر'),
    'straight-bar-triceps-pushdown': local('media/straight-bar-triceps-pushdown.webp', 'فیتامین', 'پشت‌بازو سیمکش با میله صاف'),
    'standing-calf-raise': local('media/standing-calf-raise.webp', 'فیتامین', 'ساق ایستاده دستگاه'),
    'cable-wrist-curl': local('media/cable-wrist-curl.webp', 'بدن‌خوبا', 'مچ سیمکش از زیر'),
    'cable-kneeling-crunch': local('media/cable-crunch.webp', 'فیتامین', 'کرانچ سیمکش'),
    'high-to-low-cable-woodchopper': local('media/high-to-low-cable-woodchopper.webp', 'بدن‌خوبا', 'وودچاپر سیمکش از بالا به پایین'),

    'front-lat-pulldown': local('media/front-lat-pulldown.webp', 'فیتامین', 'زیربغل سیمکش از جلو'),
    'straight-arm-rope-pulldown': local('media/rope-straight-arm-pulldown.webp', 'بدن‌خوبا', 'پول‌اور سیمکش دست صاف با طناب'),
    'single-arm-cable-lateral-raise': local('media/single-arm-cable-lateral-raise.webp', 'فیتامین', 'نشر جانب سیمکش تک‌دست'),
    'reverse-pec-deck': local('media/reverse-pec-deck.webp', 'فیتامین', 'فلای‌بک دستگاه'),
    'cable-face-pull': local('media/rope-face-pull.webp', 'فیتامین', 'فیس‌پول سیمکش'),
    'cable-y-raise': local('media/cable-y-raise.webp', 'LoadMuscle', 'Cable Y Raise'),
    'machine-or-dumbbell-shrug': local('media/dumbbell-shrug.gif', 'Exercise Gym GIFs DB', 'Dumbbell Shrug'),
    'machine-preacher-curl': local('media/machine-preacher-curl.webp', 'فیتامین', 'جلو بازو لاری دستگاه'),
    'incline-dumbbell-curl': local('media/incline-dumbbell-curl.webp', 'فیتامین', 'جلو بازو دمبل روی میز شیب‌دار'),
    'reverse-cable-curl': local('media/cable-reverse-curl.webp', 'فیتامین', 'جلو بازو معکوس سیمکش'),

    'wall-chin-tuck': local('media/wall-chin-tuck.svg', 'Amino', 'راهنمای متحرک آفلاین چین‌تاک کنار دیوار'),
    'thoracic-extension': local('media/thoracic-extension.mp4', 'MakeAGIF', 'Thoracic Extension with a Foam Roller'),
    'gentle-chest-stretch': local('media/gentle-chest-stretch.mp4', 'SurgiStretch', 'Doorway Arm Stretches'),

    'forward-machine-chest-press': local('media/seated-machine-chest-press.webp', 'فیتامین', 'پرس سینه دستگاه روبه‌جلو', { legacyOnly: true }),
    'cable-pull-through': local('media/cable-pull-through.webp', 'بدن‌خوبا', 'پول‌ترو سیمکش', { legacyOnly: true }),
    'alternating-dumbbell-curl': local('media/alternating-dumbbell-curl.webp', 'بدن‌خوبا', 'جلو بازو تناوبی دمبل', { legacyOnly: true }),
    'barbell-wrist-curl': local('media/barbell-wrist-curl.gif', 'Exercise Gym GIFs DB', 'Barbell Palms Up Wrist Curl Over A Bench', { legacyOnly: true })
  };
})();
