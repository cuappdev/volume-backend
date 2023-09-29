module.exports = {
  async up(db) {
      /**
       * Adding content types to all publications and article references to publications
       */
      
      const all_pubs = await db.collection('publications').find({}).toArray();
      const all_articles = await db.collection('articles').find({}).toArray();
      const all_magazines = await db.collection('magazines').find({}).toArray();
      all_pubs.map(async (pub) => {
        if(pub.slug=="thread"){
          db.collection('publications').updateOne({ _id: pub._id }, { $set: { contentTypes: ["magazines"] } });
        }
        else{
          db.collection('publications').updateOne({ _id: pub._id }, { $set: { contentTypes: ["articles"] } });
        }
      });
      all_articles.map(async (article) => {
        if(article.publicationSlug=="thread"){
          db.collection('articles').updateOne({ _id: article._id }, { $set: { "publication.contentTypes": ["magazines"] } });
        }
        else{
          db.collection('articles').updateOne({ _id: article._id }, { $set: { "publication.contentTypes": ["articles"] } });
        }
      });
      all_magazines.map(async (magazine) => {
        if(magazine.publicationSlug=="thread"){
          db.collection('magazines').updateOne({ _id: magazine._id }, { $set: { "publication.contentTypes": ["magazines"] } });
        }
        else{
          db.collection('magazines').updateOne({ _id: magazine._id }, { $set: { "publication.contentTypes": ["articles"] } });
        }
      });
  },

  async down(db) {
     /**
       * Removing content types from all publications and article references to publications
       */
         db.collection('publications').updateMany({},{ $unset: { contentTypes:"" } });
         db.collection('articles').updateMany({},{ $unset: { "publication.contentTypes":"" } });
         db.collection('magazines').updateMany({},{ $unset: { "publication.contentTypes":"" } });
      },
    };