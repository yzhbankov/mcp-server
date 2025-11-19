### Log in

`POST api/auth/log_in`

Retrieves authentication `token` for user.

Your login credentials are created in the SiteWise web portal.

#### Request Fields

| Field    | Required/Optional | Type   | Description                           |
|----------|-------------------|--------|---------------------------------------|
| email    | required          | string | Your email credential used to log in. |
| password | required          | string | Your password used to log in.         |

#### Response Fields

| Field                              | Description                                                                                                                                                                                            |
|------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| success                            | Returns whether the login attempt was successful:<ul><li>true</li><li>false</li>                                                                                                                       |
| email                              | The email used to log in.                                                                                                                                                                              |
| token                              | An authentication token to identify the current user.                                                                                                                                                  |
| company                            | A JSON object with information about the company associated with the user.                                                                                                                             |
| company.id                         | The identifier of the company in the server.                                                                                                                                                           |
| company.name                       | The company name.                                                                                                                                                                                      |
| company.user_params                | User-defined company parameters.                                                                                                                                                                       |
| company.uid                        | The unique identifier of the company.                                                                                                                                                                  |
| company.role_uid                   | Reserved field.                                                                                                                                                                                        |
| company.scope                      | Reserved field.                                                                                                                                                                                        |
| company.role                       | Reserved object.                                                                                                                                                                                       |
| role                               | Return user role <ul><li>company_admin</li><li>project_system_admin</li><li>project_operations_admin</li><li>project_maintainer</li><li>project_user</li><li>super_user</li><li>system_admin</li></ul> |

#### Example Request

```json
{
  "email": "user@example.com",
  "password": "Drv3yU7PdyqUMtr89erZ"
}
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "email": "user@company.com",
    "token": "Vwp7i3o1234Z4MqycAo_",
    "company": {
      "id": 283,
      "name": "RPP Boston",
      "taggings_count": 0,
      "user_params": {
        "color": "#ff5b5b",
        "website": "",
        "phone": "12345678900",
        "tag_allocation": false,
        "address": ""
      },
      "uid": "Kr5G4eydvoRz4YZWCStzsQ",
      "scope": "Y",
      "role_uid": "XJv7AtqCJfFHtDPJzyUF5d",
      "role": {
        "id": 3,
        "name": "Subcontractor",
        "uid": "XJv7AtqCJfFHtDPJzyUF5d",
        "display_name": "Company"
      }
    },
    "isSuperAdmin": false,
    "isSystemUser": false,
    "isCompanyAdmin": true,
    "sign_in_count": 386
  }
}

```

#### Errors

| Error Status | Error Type           | Error Body                                                                                | Description                                                                    |
|--------------|----------------------|-------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| 401          | Unauthorized         | {"success":false,"error":"Unable to log in. Check your email address and your password."} | The wrong email or password was submitted, or the token or user was not found. |
| 422          | Unprocessable entity | {"message":"Credentials are invalid"}                                                     | The wrong email or password was submitted, or the token or user was not found. |
| 401          | Unauthorized         | {"message":"Unable to log in. Check your email address and your password."}               | The wrong email or password was submitted.                                     |
| 423          | Locked               | {"message": "The user is disabled "}                                                      | The user was disabled.                                                         |

