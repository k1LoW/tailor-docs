---
doc_type: guide
---

# Data validations

Data validation allows you to define rules for your fields, including acceptable value ranges.

## Validation Properties

Use the `.validate()` method to add validation rules to a field. The method accepts validation rules as arguments, where each rule can be either:

- A validation function that returns `true` for valid values
- A tuple of `[validationFunction, errorMessage]` for custom error messages

```typescript
db.string().validate(
  ({ value }) => value.includes("@"), // validation function
  [({ value }) => value.length > 5, "Must be longer than 5 characters"], // with error message
);
```

The validation function receives an object with:

- `value`: The current field value
- `data`: The entire record data
- `user`: The user context performing the operation

**Notes:**

- The validation rules are evaluated in order
- Validation cannot access fields provided through relation associations

If `validate` field is set in schema, validation rules will be applied to the field value.
The data type of the field is an array of maps, with `expr` and `action` defined.
The `action` will be evaluated when the `expr` returns true.

| Property        | Type   | Scripting Language                        | Description                                                        |
| --------------- | ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| `script`        | string | [JavaScript](/reference/api/js-scripting) | The JavaScript code to evaluate for validation                     |
| `action`        | string | -                                         | `allow` or `deny`                                                  |
| `error_message` | string | -                                         | A string of error message to be returned when the validation fails |

**Notes:**

- The validation rules are evaluated in descending order
- `expr` cannot access the fields provided through `sourceId` association

If `Validate` field is set in schema, validation rules will be applied to the field value.
The data type of the field is an array of maps, with `Expr` and `Action` defined.
The `Action` will be evaluated when the `Expr` returns true.

| Property       | Type   | Scripting Language                        | Description                                                        |
| -------------- | ------ | ----------------------------------------- | ------------------------------------------------------------------ |
| `Script.Expr`  | string | [JavaScript](/reference/api/js-scripting) | An expression in JavaScript                                        |
| `Action`       | string | -                                         | `tailordb.#Permit.Allow` or `tailordb.#Permit.Deny`                |
| `ErrorMessage` | string | -                                         | A string of error message to be returned when the validation fails |

**Notes:**

- The validation rules are evaluated in descending order
- `Expr` cannot access the fields provided through `SourceId` association

## Examples

```typescript
// reportNumber value must be less than 100 or over 103
reportNumber: db.int().validate([
  ({ value }) => value < 100 || value > 103,
  "reportNumber value must be less than 100 or over 103",
]);
```

```typescript
// Description length should be less than 40 characters
description: db.string()
  .description("Description of the product.")
  .validate([
    ({ value }) => value.length < 40,
    "Description length should be less than 40 characters.",
  ]);
```

```typescript
// User must be logged in to create an item
itemStatus: db.string().validate([
  ({ user }) => Object.keys(user).length > 0,
  "You must be logged in to create an item",
]);
```

```javascript
  reportNumber  = {
    type          = "integer"
    validate      = [
      // reportNumber value must be less than 100 or over 103
      {
        script        = "((value, data) => { return value >=100 && value <=103})(_value, _data)"
        action        = "deny"
        error_message = "reportNumber value must be less than 100 or over 103"
      }
    ]
  }
```

```javascript
description = {
  type        = "string"
  description = "Description of the product."
  validate    = [{
    script        = "((value, data) => { return !(value.length < 40)})(_value, _data)"
    action        = "deny"
    error_message = "Description length should be less than 40 characters."
  }]
}
```

```javascript
itemStatus = {
  type     = "string"
  validate = [{
    script        = "((value, data) => { return Object.keys(user).length === 0 })(_value, _data)"
    action        = "deny"
    error_message =  "You must be logged in to create an item"
  }]
}
```

```javascript
  reportNumber: {
    Type:        tailordb.#TypeInt
    Validate: [
      // reportNumber value must be less than 100 or over 103
      {
        Script: common.#Script & {
          Expr: """
            ((value, data) => {
              return value >=100 && value <=103
            })(_value, _data)
          """
        }
        Action: tailordb.#Permit.Deny
        ErrorMessage: "reportNumber value must be less than 100 or over 103"
      }
    ]
  }
```

```javascript
description: {
  Type:        tailordb.#TypeString
  Description: "Description of the product."
  Validate: [{
    Script: common.#Script & {
      Expr: """
        ((value, data) => {
          return !(value.length < 40)
        })(_value, _data)
      """
    }
    Action: tailordb.#Permit.Deny
    ErrorMessage: "Description length should be less than 40 characters."
  }]
}
```

```javascript
itemStatus: {
  Type: tailordb.#TypeString
  Validate: [{
    Script: common.#Script & {
      Expr: """
        ((value, data) => {
          return Object.keys(user).length === 0
        })(_value, _data)
        """
      }
    Action:       tailordb.#Permit.Deny
    ErrorMessage: "You must be logged in to create an item"
  }]
}
```

### Example demonstrating how to use user attributes

```typescript
itemCode: db.string().validate([
  ({ user }) => user.attributes.includes("{ADMIN_ID}"),
  "To create an item, you must be the Admin",
]);
```

```javascript
  itemCode = {
    type     = "string"
    validate = [{
      script        = "((value, data) => { return !user.attributes.includes(\"{ADMIN_ID}\") })(_value, _data)"
      action        = "deny"
      error_message =  "To create an item, you must be the Admin"
    }]
  }
```

```javascript
  itemCode: {
    Type: tailordb.#TypeString
    Validate: [
      {
        Script: common.#Script & {
          Expr: """
            ((value, data) => {
              return !user.attributes.includes(\"{ADMIN_ID}\")
            })(_value, _data)
          """
        }
        Action:       tailordb.#Permit.Deny
        ErrorMessage: "To create an item, you must be the Admin"
      }
    ]
  }
```

## Accessible variables in expressions

You can use `_value` to refer to the current field value and `_data` to refer to the entire record.

| Variable                                    | Description                                                                                                                                                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_value`                                    | This accesses its own field value.                                                                                                                                                                                         |
| `_data.{other_field_name}`                  | Other fields can be accessed using the field name. ex. `foo == 2` accesses `foo` field                                                                                                                                     |
| `_data.{array_name}[{index}]`               | This accesses the array value. ex. `arr[0]` accesses the first value of `arr`                                                                                                                                              |
| `_data.{associative_array_name}.{key_name}` | This accesses associative array value. ex. `dict.nestedValue` accesses the `dict` associative array's `nestedValue` key value                                                                                              |
| `user`                                      | This accesses the user context. ex. `user.id` accesses the logged in user id and `user.attributes` acessess user's attributes which is an array of UUIDs that are configured in the `AttributesFields` in the Auth service |
