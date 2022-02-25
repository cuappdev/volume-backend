module.exports = {
  async up(db) {
    let Filter = require("../node_modules/bad-words");
    const filter = new Filter({emptyList: true});
    filter.addWords("covid-19","coronavirus", "pandemic","masks","mask")
    const articles = await db.collection('articles').find({}).toArray();
    articles.map( async (article) => {
        await db.collection('articles').updateOne({_id: article._id}, {$set: {isFiltered: filter.isProfane(article.title)}});
        return article;
    });
  },

  async down(db) {
    const articles = await db.collection('articles').find({}).toArray();
    articles.map( async (article) => {
      await db.collection('articles').updateOne({_id: article._id}, {$unset: {isFiltered: ""}});
      return article;
    });
    },
};