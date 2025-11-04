# GROUPS

Use the groups API to:

* Add a new group

#### HTTP Headers

The HTTP headers used to access all RTLS APIs are listed below. Before submitting requests to the Groups API, set the
following headers:

| Header Name    | Example Value          | Description                                            |
|----------------|------------------------|--------------------------------------------------------|
| X-User-Email   | admin@example.com      | Email of the user performing HTTP requests to the API. |
| X-User-Token   | Drv3yU7PdyqUMtr89erZ   | Token allowing user access to the API.                 |
| X-User-Project | OfOgUA4kTs2HrmYYlFw6Jg | Project identifier. Value of the `project.uid` field.  |

##### Set header X-USER-EMAIL

Send a request to log in using `POST api/auth/log_in.json` described in the [Auth API](auth.md). Using the email address
returned in the response, set:
`X-USER-EMAIL = data.email`

##### Set header X-USER-TOKEN

Send a request to log in using `POST api/auth/log_in.json` described in the [Auth API](auth.md). Using the
authentication token returned in the response, set:
`X-USER-TOKEN = data.token`

##### Set header X-USER-PROJECT

Send a request to get projects using `GET api/projects/` described in the [Projects API](projects.md). You must send
this request with headers X-USER-EMAIL and X-USER-TOKEN already set. Using the project UID returned in the response,
set:
`X-USER-PROJECT = projects[i].uid`

## Groups Endpoints

| Functionality                         | Method | Endpoint           |
|---------------------------------------|--------|--------------------|
| [add group](#add-group)               | POST   | `api/groups`       |

## Endpoints

### Add group

`POST api/groups`

Add a new group.

#### Request Fields

| Field                             | Required | Type                                             | Description                                                                 |
|-----------------------------------|----------|--------------------------------------------------|-----------------------------------------------------------------------------|
| name                              | required | string                                           | {{ page.name_description }}                                                 |
| user_params                       | optional | object                                           | {{ page.user_params_description }}                                          |
| custom_info                       | optional | string({{ page.custom_info_value_description }}) | Optionally, enter up to 120 characters of custom information for the group. |
| color                             | optional | string                                           | {{ page.color_description }}                                                |

#### Response Fields

| Field                             | Description                                              |
|-----------------------------------|----------------------------------------------------------|
| uid                               | {{ page.uid_description }}                               |
| name                              | {{ page.name_description }}                              |
| user_params                       | {{ page.user_params_description }}                       |
| custom_info                       | {{ page.custom_info_description }}                       |
| color                             | {{ page.color_description }}                             |
| project_uid                       | {{ page.project_uid_description }}                       |
| company_uid                       | {{ page.company_uid_description }}                       |
| created_at                        | {{ page.created_at_description }}                        |
| updated_at                        | {{ page.updated_at_description }}                        |
| removed_at                        | {{ page.removed_at_description }}                        |


#### Example Request

```json
{
  "name": "Group1",
  "user_params": {
    "color": "#00ff9f"
  },
  "custom_info": "text",
  "color": "#00ff9f"
}
```

#### Example Response

```json
{
  "uid": "H-wd7xiASvCLO4Vey0Y9RQ",
  "name": "Group1",
  "user_params": {
    "color": "#00ff9f"
  },
  "project_uid": "9qMmFuDLPYJczE4Jq2QIWR",
  "company_uid": "ld7l94MLD5UeIXWJoi9SQp",
  "created_at": "2018-06-27T16:59:17.474Z",
  "updated_at": "2018-06-27T16:59:17.474Z",
  "removed_at": "9999-12-31T23:59:59.000Z",
  "custom_info": "text",
  "color": "#00ff9f"
}
```

#### Errors

| Error Status | Error Type           | Error Body                                                                                 | Error Description                       |
|--------------|----------------------|--------------------------------------------------------------------------------------------|-----------------------------------------|
| 422          | Unprocessable Entity | {"message":"Group with name ... exists in project ...", "name":"UnprocessableEntityError"} | A group with the specified name exists. |
