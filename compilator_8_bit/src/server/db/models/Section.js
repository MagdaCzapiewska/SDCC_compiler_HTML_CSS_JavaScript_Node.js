const { DataTypes } = require('sequelize');

module.exports.init = (db) => {
    const SectionType = db.define('SectionType', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
        indexes: [{
            unique: true,
            fields: ['name']
        }]
    });

    const SectionStatus = db.define('SectionStatus', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
        indexes: [{
            unique: true,
            fields: ['name']
        }]
    });

    const Section = db.define('Section', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        description: {
            type: DataTypes.STRING(1000),
            allowNull: true
        },
        // create_date: {
        //     type: DataTypes.DATE,
        //     allowNull: false
        // },
        file_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        start_line: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        end_line: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        section_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        section_status_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        status_data: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        source_code: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        // createdAt: 'create_date',
        timestamps: false,
        freezeTableName: true,
        indexes: [{
            fields: ['file_id'],
        },
        {
            fields: ['section_type_id'],
        },
        {
            fields: ['section_status_id'],
        }]
    });

    const File = db.models.File;
    Section.belongsTo(File, {
        foreignKey: 'file_id',
        targetKey: 'id'
    });
    Section.belongsTo(SectionType, {
        foreignKey: 'section_type_id',
        targetKey: 'id'
    });
    Section.belongsTo(SectionStatus, {
        foreignKey: 'section_status_id',
        targetKey: 'id'
    });
};