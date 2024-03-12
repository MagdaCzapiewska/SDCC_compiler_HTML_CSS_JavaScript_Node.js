const { DataTypes } = require('sequelize');

module.exports.init = (db) => {
    const File = db.define('File', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(1000),
            allowNull: true
        },
        create_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        enable_update_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        update_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        folder_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        source_code: {
            type: DataTypes.TEXT,
            allowNull: false,
            defaultValue: ""
        }
    },
    {
        createdAt: 'create_date',
        updatedAt: 'update_date',
        timestamps: true,
        freezeTableName: true,
        indexes: [{
            fields: ['folder_id']
        }]
    });

    const Folder = db.models.Folder;
    File.belongsTo(Folder, {
        foreignKey: 'folder_id',
        targetKey: 'id'
    });
};
