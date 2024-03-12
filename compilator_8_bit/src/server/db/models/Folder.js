const { DataTypes } = require('sequelize');

module.exports.init = (db) => {
    const Folder = db.define('Folder', {
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
        parent_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    },
    {
        createdAt: 'create_date',
        updatedAt: 'update_date',
        timestamps: true,
        freezeTableName: true,
        indexes: [{
            fields: ['parent_id']
        }]
    });
};
