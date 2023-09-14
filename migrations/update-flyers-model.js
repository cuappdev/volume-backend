module.exports = {
  up(db) {
    /**
     * Updating flyers model to switch to singular organization object and
     * singular organization slug
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
     * Reset organizations field to array of size 1 containing current flyer's
     * organization. Resets organizationSlugs to an array of size 1 containing
     * current flyer's organization slug.
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
