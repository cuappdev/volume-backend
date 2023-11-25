module.exports = {
  async up(db) {
    /**
     * Adds the bookmarkedArticles, bookmarkedMagazines, and bookmarkedFlyers fields to all users.
     * Removes the numBookmarkedArticles field from all users
     */
    const users = await db.collection('users').find({}).toArray();
    users.map(async (user) => {
      await db
        .collection('users')
        .updateOne(
          { _id: user._id },
          { $set: { bookmarkedArticles: [], bookmarkedMagazines: [], bookmarkedFlyers: [] } },
        );
      await db
        .collection('users')
        .updateOne({ _id: user._id }, { $unset: { numBookmarkedArticles: '' } });
      return user;
    });
  },

  async down(db) {
    /**
     * Removes the bookmarkedArticles, bookmarkedMagazines, and bookmarkedFlyers fields from all users.
     * Adds the numBookmarkedArticles field to all users
     */
    const users = await db.collection('users').find({}).toArray();
    users.map(async (user) => {
      await db
        .collection('users')
        .updateOne(
          { _id: user._id },
          { $unset: { bookmarkedArticles: '', bookmarkedMagazines: '', bookmarkedFlyers: '' } },
        );
      await db
        .collection('users')
        .updateOne({ _id: user._id }, { $set: { numBookmarkedArticles: 0 } });
      return user;
    });
  },
};
