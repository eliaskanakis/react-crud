# CrudList

CrudList is a react function components that provides CRUD functionality.
Its purpose is just to showcase some ideas.

## Live Demo

A live demo of the component is availiable at [https://react-crud.azurewebsites.net/](https://react-crud.azurewebsites.net/)

## Install

Copy the crud folder into a subfolder of src.
Dependencies:
- React Bootstrap [https://react-bootstrap.github.io/](https://react-bootstrap.github.io/)

# Usage

## React

```
<CrudList layoutUrl=<url of the layout> />
```
Example:
```
<CrudList layoutUrl="https://crudservices.azurewebsites.net/api/layouts/category-list/api/layouts/category-list" />
```
## Layout Url

layoutUrl is a url that responds the list layout in json format. A simple layout example is the following:
```
{
    "queryObject": "categories",
    "caption": "Categories",    
    "allowNew": true,
    "allowUpdate": true,
    "allowDelete": true,
    "editFormUrl": "api/layouts/category-form",
    "columns": [
    {
        "columnName": "id",
        "caption": "#"
    },
    {
        "columnName": "description",
        "caption": "Description"
    }
    ],
    "primaryKey": [ "id" ]
}
```

Other list layouts can be found on the following urls:
- [https://crudservices.azurewebsites.net/api/layouts/category-list](https://crudservices.azurewebsites.net/api/layouts/category-list)
- [https://crudservices.azurewebsites.net/api/layouts/guitar-list](https://crudservices.azurewebsites.net/api/layouts/guitar-list)

## GraphQL endpoint

GrudList uses the environment variable REACT_APP_SERVER_URL.
It sends graphQL resquests to `${process.env.REACT_APP_SERVER_URL}/api/query}`.

For demo purposes the following variable has been declared at .env as:
REACT_APP_SERVER_URL=https://crudservices.azurewebsites.net

## Form Layout Url

editFormUrl (property of list layout), is a url that responds the form layout in json format. A simple form layout example is the following:

```
{
    "queryObject": "category",
    "caption": "Category",
    "tabs": [
        {
            "caption": "Category info",
            "columns": [
                {
                    "columnName": "description",
                    "caption": "Description"
                },
                {
                    "columnName": "imageUrl",
                    "caption": "Image Url",
                    "controlType": "ImageUrl" 
                }
            ]
        }
    ]
}
```

Other list layouts can be found on the following urls:
- [https://crudservices.azurewebsites.net/api/layouts/category-form](https://crudservices.azurewebsites.net/api/layouts/category-form)
- [https://crudservices.azurewebsites.net/api/layouts/guitar-form](https://crudservices.azurewebsites.net/api/layouts/guitar-form)

# GraphQL examples

The component genarates graphQL to send it at `${process.env.REACT_APP_SERVER_URL}/api/query}`.
Query generation is based on the following properties of the layout:
- queryObject
- columns.columnName
- primaryKey
- columns.lookUpQuery (see category column of guitar-form layout)
- columns.keyFields.foreignField

Checking the following examples, may help you ensure about the graphQL support that your backend must provide. Singular or plural make sense!
The demo at [https://react-crud.azurewebsites.net/](https://react-crud.azurewebsites.net/) generates the following graphQL:

- Categories retrieval
```
{
  categories {
    id
    description
  }
}
```
- Category retrieval by id
```
{
  category(id: $id) {
    description
    imageUrl
    id
  }
}
Variables:
{id: 1}
```
- Guitars retrieval
```
{
  guitars(category: $category, description: $description) {
    description
    price
    isVintage
    color
    id
    category {
      description
    }
  }
}
Variables:
{
  description: "electric"
}
```
- Guitar retrieval by id
```
{
  guitar(id: $id) {
    description
    isVintage
    price
    color
    imageUrl
    id
    category {
      description
    }
  }
}
Variables:
{
  id: 1
}
```
- Add Category
```
mutation addCategory($obj: Category!) {
  addCategory(category: $obj) {
    id
    description
  }
}
Variables:
{
  "obj": {
    	"description":"New category"
  }
}
```
- Update Category
```
mutation updateCategory($obj: Category!) {
  updateCategory(category: $obj) {
    id
    description
    guitars {
      description
    }
  }
}
Variables:
{
  "obj": {
    	"description":"Ukuleles",
        "id":4
  }
}
```
- Delete Category
```
mutation deleteCategory($obj: Category!) {
  deleteCategory(category: $obj) 
}
Variables:
{
  "obj": {
        "id":4
  }
}
```
