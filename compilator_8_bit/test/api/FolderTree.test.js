const assert = require('node:assert');
const FolderTree = require('../../src/server/api/FolderTree');

const folders = [
    {
        "id": 1,
        "name": "Clothing",
        "description": "",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": null
    },
    {
        "id": 2,
        "name": "Mens",
        "description": "",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 1
    },
    {
        "id": 3,
        "name": "Womens",
        "description": "",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 1
    },
    {
        "id": 4,
        "name": "Suits",
        "description": "",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 2
    },
    {
        "id": 5,
        "name": "Slacks",
        "description": "Suit Slacks",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 4
    },
    {
        "id": 6,
        "name": "Jackets",
        "description": "Suit Jackets",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 4
    },
    {
        "id": 7,
        "name": "Dresses",
        "description": "Women Dresses",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 3
    },
    {
        "id": 8,
        "name": "Skirts",
        "description": "Women Skirts",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 3
    },
    {
        "id": 9,
        "name": "Blouses",
        "description": "Women Blouses",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 3
    },
    {
        "id": 10,
        "name": "Evening",
        "description": "Evening Dresses",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 7
    },
    {
        "id": 11,
        "name": "SunDresses",
        "description": "SunDresses",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 7
    },
    {
        "id": 12,
        "name": "Shirts",
        "description": "",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": false,
        "enable_update_date": "2023-04-24T19:08:52.141Z",
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 2
    },
    {
        "id": 13,
        "name": "Shirts",
        "description": "",
        "create_date": "2023-04-24T19:08:52.141Z",
        "enabled": false,
        "enable_update_date": "2023-04-24T19:08:52.141Z",
        "update_date": "2023-04-24T19:08:52.141Z",
        "parent_id": 3
    }
];

const files = [
    {
        "id": 1,
        "name": "just_lines.c",
        "description": "",
        "create_date": "2023-04-24T19:29:05.447Z",
        "enabled": true,
        "enable_update_date": null,
        "update_date": "2023-04-24T19:29:05.447Z",
        "folder_id": 7,
        "source_code": "line 1\nline 2\nline 3\nline 4\nline 5\nline 6\nline 7\nline 8\nline 9\nline 10\nline 11\nline 12\nline 13\nline 14\nline 15\nline 16\nline 17\nline 18\nline 19\nline 20\nline 21\nline 22\nline 23\nline 24\nline 25\nline 26\nline 27\nline 28\nline 29\nline 30\nline 31\nline 32\nline 33\nline 34\nline 35\nline 36\nline 37\nline 38\nline 39\nline 40\nline 41\nline 42\nline 43\nline 44\nline 45\nline 46\nline 47\nline 48\nline 49\nline 50\nint main(void) {\n//comment\n//comment\n}\n"
    }
];

const expected = [
    {
      "id": 1,
      "name": "Clothing",
      "is_file": false,
      "children": [
        {
          "id": 2,
          "name": "Mens",
          "is_file": false,
          "children": [
            {
              "id": 4,
              "name": "Suits",
              "is_file": false,
              "children": [
                {
                  "id": 5,
                  "name": "Slacks",
                  "is_file": false,
                  "children": [],
                  "has_children": false
                },
                {
                  "id": 6,
                  "name": "Jackets",
                  "is_file": false,
                  "children": [],
                  "has_children": false
                }
              ],
              "has_children": true
            }
          ],
          "has_children": true
        },
        {
          "id": 3,
          "name": "Womens",
          "is_file": false,
          "children": [
            {
              "id": 7,
              "name": "Dresses",
              "is_file": false,
              "children": [
                {
                  "id": 10,
                  "name": "Evening",
                  "is_file": false,
                  "children": [],
                  "has_children": false
                },
                {
                  "id": 11,
                  "name": "SunDresses",
                  "is_file": false,
                  "children": [],
                  "has_children": false
                },
                {
                  "id": 1,
                  "name": "just_lines.c",
                  "is_file": true
                }
              ],
              "has_children": true
            },
            {
              "id": 8,
              "name": "Skirts",
              "is_file": false,
              "children": [],
              "has_children": false
            },
            {
              "id": 9,
              "name": "Blouses",
              "is_file": false,
              "children": [],
              "has_children": false
            }
          ],
          "has_children": true
        }
      ],
      "has_children": true
    }
];

const db = {
    models: {
        Folder: {
            findAll: () => folders
        },
        File: {
            findAll: () => files
        }
    }
}

describe("FolderTree methods", () => {
    it("getFolderStructure", async () => {
        const folderTree = new FolderTree(db);
        const actual = await folderTree.getFolderStructure();
        
        assert.deepStrictEqual(actual, expected);
    });
});

