### Authentication APIs

#### Sign Up API

**Endpoint:**  
`POST http://localhost:5000/api/v1/auth/sign_up`

**Description:**  
Register a new user in the system.

**Request Payload:**
```json
{
  "strEmail": "harsh@123gmail.com",
  "strName": "harshad bs",
  "strPassword": "harshad@123",
  "strRole": "USER"
}
```

---

#### Login API

**Endpoint:**  
`POST http://localhost:5000/api/v1/auth/login`

**Description:**  
Authenticate a user and generate an access token.

**Request Payload:**
```json
{
  "strEmail": "harsh@123gmail.com",
  "strPassword": "harshad@123"
}
```

---

#### Reset Password API

**Endpoint:**  
`POST http://localhost:5000/api/v1/auth/reset_password`

**Description:**  
Reset the password for an existing user.

**Request Payload:**
```json
{
  "strEmail": "harsh@123gmail.com",
  "strOldPassword": "harshad@123",
  "strNewPassword": "harshadlatest@555"
}
```

---

### Stock Management APIs

#### Create Stock API

**Endpoint:**  
`POST http://localhost:5000/api/v1/master/stock/create_stock`

**Description:**  
Create a new stock entry in the system.

**Request Payload:**
```json
{
  "strStockCode": "ST1",
  "strStockName": "stock-1",
  "intUserId": 3
}
```

---

#### Get Stock API

**Endpoint:**  
`GET http://localhost:5000/api/v1/master/stock/get_stock`

**Description:**  
Retrieve stock details based on the provided criteria.

**Request Payload:**
```json
{
  "strStockCode": "ST1",
  "strStockName": "stock-1"
}
```

---

#### Update Stock API

**Endpoint:**  
`PUT http://localhost:5000/api/v1/master/stock/update_stock`

**Description:**  
Update an existing stock entry.

**Request Payload:**
```json
{
  "intStockId": 1,
  "strStockCode": "ST1-UPDATE",
  "strStockName": "stock-1_update",
  "intUserId": 3
}
```

---

#### Delete Stock API

**Endpoint:**  
`DELETE http://localhost:5000/api/v1/master/stock/delete_stock`

**Description:**  
Delete a stock entry using its unique ID.

**Request Payload:**
```json
{
  "intStockId": 1
}
```

---

### Customer Management APIs

#### Get Customer API

**Endpoint:**  
`GET http://localhost:5000/api/v1/master/customer/get_customer`

**Description:**  
Retrieve a list of customers based on filter criteria, pagination, and sorting options.

**Request Payload:**
```json
{
  "objFilter": {
    "intCustomerId": 1,
    "strCustomerCode": "CUST001",
    "strCustomerName": "John Doe",
    "strEmail": "johndoe@example.com",
    "blnBranch": true
  },
  "objPagination": {
    "intPage": 1,
    "intPageSize": 10
  },
  "objSort": {
    "strActive": "datCreated",
    "strDirection": "asc"
  }
}
```

**Response:**
```json
{
  "objPagination": {
    "intPage": 1,
    "intPageSize": 10,
    "intTotalCount": 100
  },
  "objSort": {
    "strActive": "datCreated",
    "strDirection": "asc"
  },
  "arrList": [
    {
      "slNo": 1,
      "intCustomerId": 1,
      "datCreated": "2023-01-01T10:00:00Z",
      "datModified": "2023-01-10T15:00:00Z",
      "strCreatedBy": "admin",
      "strModifiedBy": "admin",
      "strCustomerCode": "CUST001",
      "strCustomerName": "John Doe",
      "strEmail": "johndoe@example.com"
    },
    {
      "slNo": 2,
      "intCustomerId": 2,
      "datCreated": "2023-01-02T11:00:00Z",
      "datModified": "2023-01-11T16:00:00Z",
      "strCreatedBy": "admin",
      "strModifiedBy": "admin",
      "strCustomerCode": "CUST002",
      "strCustomerName": "Jane Smith",
      "strEmail": "janesmith@example.com"
    }
  ]
}
```

---

#### Create Customer API

**Endpoint:**  
`POST http://localhost:5000/api/v1/master/customer/create_customer`

**Description:**  
Create a new customer in the system with the provided details.

**Request Payload:**
```json
{
  "strCustomerCode": "CUST003",
  "strCustomerName": "Alice Johnson",
  "strPhone": "1234567890",
  "strEmail": "alicejohnson@example.com",
  "strAddress": "123 Main Street, Cityville",
  "dblDiscountPercent": 10.5,
  "strGstNo": "GST123456",
  "strGstAddress": "123 GST Street, Cityville",
  "dblOutStanding": 500.0
}
```

**Response:**
```json
{
  "intCustomerId": 3,
  "strMessage": "CUSTOMER_CREATED_SUCCESSFULLY"
}
```

---

#### Delete Customer API

**Endpoint:**  
`DELETE http://localhost:5000/api/v1/master/customer/delete_customer`

**Description:**  
Delete an existing customer from the system using their unique customer ID.

**Request Payload:**
```json
{
  "intCustomerId": 1
}
```

**Response:**
```json
{
  "strMessage": "CUSTOMER_DELETED_SUCCESSFULLY",
  "intStatusCode": 200
}
```
