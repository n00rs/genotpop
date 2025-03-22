http://localhost:5000/api/v1/auth/sign_up

{
  "strEmail": "harsh@123gmail.com",
  "strName": "harshad bs",
  "strPassword": "harshad@123",
  "strRole": "USER"
}

http://localhost:5000/api/v1/auth/login

{
  "strEmail": "harsh@123gmail.com",
  "strPassword": "harshad@123"
}


http://localhost:5000/api/v1/auth/reset_password

{
  "strEmail": "harsh@123gmail.com",
  "strOldPassword": "harshad@123",
  "strNewPassword": "harshadlatest@555"
}


http://localhost:5000/api/v1/master/stock/create_stock

{
  "strStockCode" : "ST1",
  "strStockName" : "stock-1",
  "intUserId" : 3
}

http://localhost:5000/api/v1/master/stock/get_stock

{
  "strStockCode" : "ST1",
  "strStockName" : "stock-1"
}

http://localhost:5000/api/v1/master/stock/update_stock

{
  "intStockId" : 1,
  "strStockCode" : "ST1-UPDATE",
  "strStockName" : "stock-1_update",
  "intUserId" : 3
}


http://localhost:5000/api/v1/master/stock/delete_stock

{
  "intStockId" : 1
}