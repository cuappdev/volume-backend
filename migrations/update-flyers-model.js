module.exports = {
  up(db) {
    /**
     * Updating Flyers model to include new fields and switch to organizations
     */
    return db.collection('flyers').updateMany({}, [
      {
        $set: {
          organization: { $first: '$organizations' },
          organizationSlug: { $first: '$organizationSlugs' },
        },
      },
      {
        $unset: ['organizations', 'organizationSlugs'],
      },
    ]);
  },

  down(db) {
    /**
     * Reset organizations field to array of size 1 containing current Flyer's
     * organizations
     */
    return db.collection('flyers').updateMany({}, [
      {
        $set: {
          organizations: ['$organization'],
          organizationSlugs: ['$organizationSlug'],
        },
      },
      {
        $unset: ['organization', 'organizationSlug'],
      },
    ]);
  },
};
