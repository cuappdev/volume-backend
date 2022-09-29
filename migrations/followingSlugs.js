module.exports = {
    async up(db) {
        /**
         * Convering user followed publication ids to slugs
         */
        const allUsers = await db.collection('users').find({}).toArray();
        allUsers.forEach(async (user) => {
            const pubIds = user.followedPublications;
            await db.collection('users').updateOne({ _id: user._id }, { $set: { followedPublications: [] } });
            pubIds.forEach(async (id) => {
                const pubData = await db.collection('publications').findOne({ _id: id })
                await db.collection('users').updateOne({ _id: user._id }, { $push: { followedPublications: pubData.slug } });
            });
        })
    },

    async down(db) {
        /**
         * Convering user followed publication slugs to ids
         */
        const allUsers = await db.collection('users').find({}).toArray();
        allUsers.forEach(async (user) => {
            const pubSlugs = user.followedPublications;
            await db.collection('users').updateOne({ _id: user._id }, { $set: { followedPublications: [] } });
            pubSlugs.forEach(async (slug) => {
                const pubData = await db.collection('publications').findOne({ slug: slug })
                await db.collection('users').updateOne({ _id: user._id }, { $push: { followedPublications: pubData._id } });
            });
        })
    }
}