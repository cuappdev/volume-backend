module.exports = {
  async up(db) {
    const articles = await db.collection('articles').find({}).toArray();
    articles.map( async (article) => {
      let pub = await db.collection('publications').find({slug : article.publicationSlug}).toArray();
      pub = pub[0]
      if(pub!==undefined){
      await db.collection('articles').updateOne({_id: article._id}, {$set: {publication: {
        slug: pub['slug'],
        backgroundImageURL: pub['backgroundImageURL'],
        bio: pub['bio'],
        bioShort: pub['bioShort'],
        name: pub['name'],
        profileImageURL: pub['profileImageURL'],
        rssName: pub['rssName'],
        rssURL: pub['rssURL'],
        websiteURL: pub['websiteURL']
  }
      }});}
      return article;
    });
  },

  async down(db) {
    const articles = await db.collection('articles').find({}).toArray();
    articles.map( async (article) => {
      await db.collection('articles').updateOne({_id: article._id}, {$unset: {publication: ''}});
      return article;
    });
    },
};