const sectionType = [
    {
        //"id": 1,
        "name": "procedure"
    },
    {
        //"id": 2,
        "name": "comment"
    },
    {
        //"id": 3,
        "name": "directive"
    },
    {
        //"id": 4,
        "name": "variable"
    },
    {
        //"id": 5,
        "name": "assembly"
    }
]

const sectionStatus = [
    {
        //"id": 1,
        "name": "Compiled without warnings"
    },
    {
        //"id": 2,
        "name": "Compiled with warnings"
    },
    {
        //"id": 3,
        "name": "Does not compile"
    }
]

module.exports.run = (db) => {
    // sectionType.forEach((type) => {
    //     type.createdAt = new Date();
    //     type.updatedAt = new Date();
    // });
    // sectionStatus.forEach((status) => {
    //     status.createdAt = new Date();
    //     status.updatedAt = new Date();
    // });

    return Promise.all([
        db.queryInterface.bulkInsert('SectionType', sectionType, {'ignoreDuplicates': true}),
        db.queryInterface.bulkInsert('SectionStatus', sectionStatus, {'ignoreDuplicates': true}),
    ]);
};
