CREATE TABLE IF NOT EXISTS tbl_user (
  pk_bint_user_id SERIAL PRIMARY KEY NOT NULL,
  vchr_email VARCHAR(100) UNIQUE NOT NULL,
  vchr_name VARCHAR(100) NOT NULL,
  vchr_password TEXT NOT NULL, -- Store hashed password
  vchr_role VARCHAR(20) NOT NULL,
  bln_privileged_user BOOLEAN DEFAULT FALSE,  -- no use
  vchr_phone VARCHAR(20),
  dat_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dat_modified TIMESTAMP WITH TIME ZONE,
  fk_bint_created_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  fk_bint_modified_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  vchr_acc_private_key TEXT,
  vchr_acc_public_key TEXT,
  vchr_refr_private_key TEXT,
  vchr_refr_public_key TEXT,
  chr_document_status CHAR(1) DEFAULT 'N'
);
CREATE INDEX IF NOT EXISTS idx_user_email 
ON tbl_user(vchr_email);

CREATE TABLE IF NOT EXISTS tbl_category (
  pk_bint_category_id SERIAL PRIMARY KEY NOT NULL,
  vchr_category_code VARCHAR(100) UNIQUE NOT NULL,
  vchr_category_name VARCHAR(100) NOT NULL,
  dat_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dat_modified TIMESTAMP WITH TIME ZONE,
  fk_bint_created_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  fk_bint_modified_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  chr_document_status CHAR(1) DEFAULT 'N'
);
CREATE INDEX IF NOT EXISTS idx_category_code_and_name 
ON tbl_category(vchr_category_code, vchr_category_name, chr_document_status);

CREATE TABLE IF NOT EXISTS tbl_stock (
  pk_bint_stock_id SERIAL PRIMARY KEY NOT NULL,
  vchr_stock_code VARCHAR(100) UNIQUE NOT NULL,
  vchr_stock_name VARCHAR(100) NOT NULL,
  dat_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dat_modified TIMESTAMP WITH TIME ZONE,
  fk_bint_created_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  fk_bint_modified_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  chr_document_status CHAR(1) DEFAULT 'N'
);
CREATE INDEX IF NOT EXISTS idx_stock_code_and_name 
ON tbl_stock(vchr_stock_code, vchr_stock_name);

CREATE TABLE IF NOT EXISTS tbl_customer (
  pk_bint_customer_id SERIAL PRIMARY KEY NOT NULL,
  vchr_customer_code VARCHAR(100) UNIQUE NOT NULL,
  vchr_customer_name VARCHAR(255) NOT NULL,
  vchr_phone VARCHAR(20) NOT NULL,
  vchr_email VARCHAR(100),
  vchr_address TEXT,
  dbl_discount_percent DECIMAL(10,2) DEFAULT 0 CHECK (dbl_discount_percent >= 0),
  vchr_gst_no VARCHAR(15) UNIQUE, 
  vchr_gst_address TEXT,
  dbl_outstanding DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
  dat_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dat_modified TIMESTAMP WITH TIME ZONE,
  fk_bint_created_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  fk_bint_modified_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  chr_document_status CHAR(1) DEFAULT 'N'
);
CREATE INDEX IF NOT EXISTS idx_customer_code_and_name 
ON tbl_customer(vchr_customer_code, vchr_customer_name);


CREATE TABLE IF NOT EXISTS tbl_inventory (
  pk_bint_inventory_id SERIAL PRIMARY KEY NOT NULL,
  vchr_batchcode VARCHAR(100) UNIQUE NOT NULL,
  fk_bint_category_id INTEGER REFERENCES tbl_stock(pk_bint_stock_id) ON DELETE CASCADE,
  fk_bint_stock_id INTEGER REFERENCES tbl_category(pk_bint_category_id) ON DELETE CASCADE,
  dbl_cost DECIMAL(10,2) NOT NULL CHECK (dbl_cost >= 0),
  dbl_unit_price DECIMAL(10,2) NOT NULL CHECK (dbl_unit_price >= 0),
  dbl_quantity INT NOT NULL CHECK (dbl_quantity >= 0),
  dat_expiry DATE,
  chr_document_status CHAR(1) DEFAULT 'N',
  dat_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dat_modified TIMESTAMP WITH TIME ZONE,
  fk_bint_created_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  fk_bint_modified_id INTEGER REFERENCES tbl_user(pk_bint_user_id)
);

CREATE TABLE IF NOT EXISTS tbl_sales_master (
  pk_bint_sales_master_id SERIAL PRIMARY KEY NOT NULL,
  vchr_document_number VARCHAR(50) UNIQUE NOT NULL,
  dat_document DATE NOT NULL,
  vchr_refference VARCHAR (200),
  fk_bint_customer_id INTEGER NOT NULL REFERENCES tbl_customer(pk_bint_customer_id) ON DELETE CASCADE,  
  dbl_gst_percentage DECIMAL(5,2) NOT NULL CHECK (dbl_gst_percentage >= 0 AND dbl_gst_percentage <= 100),
  dbl_before_vat DECIMAL(10,2) NOT NULL CHECK (dbl_before_vat >= 0),
  dbl_total_amount DECIMAL(10,2) NOT NULL, 
  chr_document_status CHAR(1) DEFAULT 'N',
  dat_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dat_modified TIMESTAMP WITH TIME ZONE,
  fk_bint_created_id INTEGER REFERENCES tbl_user(pk_bint_user_id),
  fk_bint_modified_id INTEGER REFERENCES tbl_user(pk_bint_user_id)
);

CREATE TABLE IF NOT EXISTS tbl_sales_master_details (
  pk_bint_sales_master_details_id SERIAL PRIMARY KEY,
  fk_bint_sales_master_id INTEGER NOT NULL REFERENCES tbl_sales_master(pk_bint_sales_master_id) ON DELETE CASCADE,
  fk_bint_category_id INTEGER NOT NULL REFERENCES tbl_category(pk_bint_category_id) ON DELETE CASCADE,
  fk_bint_stock_id INTEGER NOT NULL REFERENCES tbl_stock(pk_bint_stock_id) ON DELETE CASCADE,
  fk_bint_inventory INTEGER REFERENCES tbl_inventory(pk_bint_inventory_id) ON DELETE SET NULL,
  dbl_discount_percent DECIMAL(10,2) DEFAULT 0 CHECK (dbl_discount_percent >= 0),
  dbl_unit_price DECIMAL(10,2) NOT NULL CHECK (dbl_unit_price >= 0),
  vchr_refference VARCHAR (200),
  dbl_quantity DECIMAL(10,2) NOT NULL CHECK (dbl_quantity >= 0),
  dbl_total_amount DECIMAL(10,2) NOT NULL CHECK (dbl_total_amount >= 0),
  chr_document_status CHAR(1) DEFAULT 'N' CHECK (chr_document_status IN ('N', 'Y')),
  dat_created TIMESTAMP WITH TIME ZONE DEFAULT now(),
  dat_modified TIMESTAMP WITH TIME ZONE,
  fk_bint_created_id INTEGER REFERENCES tbl_user(pk_bint_user_id) ON DELETE SET NULL,
  fk_bint_modified_id INTEGER REFERENCES tbl_user(pk_bint_user_id) ON DELETE SET NULL
);
