function index(req, res) {
  res.status(200).json({
    data: {
      countries: [
        { az: "Kolumbiya", en: "Colombia", ru: "Колумбия" },
        { az: "Kosta Rika", en: "Costa Rica", ru: "Коста-Рика" },
        { az: "Etiopiya", en: "Ethiopia", ru: "Эфиопия" },
        { az: "Kenya", en: "Kenya", ru: "Кения" },
        { az: "Brazilya", en: "Brazil", ru: "Бразилия" },
        {
          az: "Brazilya / Etiopiya",
          en: "Brazil / Ethiopia",
          ru: "Бразилия / Эфиопия",
        },
        {
          az: "Brazilya / Kosta Rika",
          en: "Brazil / Costa Rica",
          ru: "Бразилия / Коста-Рика",
        },
      ],
    },
  });
}


module.exports = {
  index,
};