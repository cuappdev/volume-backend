module.exports = {
  async up(db) {
     /**
     * Adds the `isFiltered` field to all articles.
     */
    let Filter = require('../node_modules/bad-words');
    const filter = new Filter({emptyList: true});
    filter.addWords('covid-19','coronavirus', 'pandemic','masks','mask','test','testing','tests')
    const articles = await db.collection('articles').find({}).toArray();
    articles.map( async (article) => {
        await db.collection('articles').updateOne({_id: article._id}, {$set: {isFiltered: filter.isProfane(article.title)}});
        return article;
    });
  },

  async down(db) {
    /**
     * Reverts the changes to the mongo database.
     */
    const articles = await db.collection('articles').find({}).toArray();
    articles.map( async (article) => {
      await db.collection('articles').updateOne({_id: article._id}, {$unset: {isFiltered: ''}});
      return article;
    });
    },
};