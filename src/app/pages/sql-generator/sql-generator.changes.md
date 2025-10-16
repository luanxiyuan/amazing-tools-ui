## Overall Introduction
#### 一个用来生成可以被LLM模型理解的prompot工具，生成的prompt可以直接给LLM帮忙生成最优sql的工具，本文件用来描述前端页面相关的需求和规范

## 文档生成基本要求
#### 1. 所有生成的代码于其他模块用到的angular，ngzorro框架严格一直，编码风格统一，代码规范统一，注释规范统一
#### 2. 不修改其他模块的代码，只修改当前模块的代码
#### 3. 常量放到统一的文件中，尽量避免在代码中写常量
#### 4. 请求API过程中要有loading效果，跟其他模块的交互方式一致
#### 5. 页面label全部用英文

## API 接口
#### API urls 配置在sys-consts.ts中
1. 获取支持的数据库类型：`/sql_generator/db_types`
   - 请求方式：get
   - 返回结果：[ {"name": "mysql"， value: "Mysql"}, {"name": "postgresql"， value: "PostgreSQL"}]
2. 获取指定数据库类型的所有表：`/sql_generator/tables`
   - 请求方式：post
   - 请求参数：{ "dbType": "mysql", "host": "localhost", "port": "3306", "database": "testDatabase", "username": "testUser", "password": "testPassword" }
   - 返回结果：["table1", "table2", "table3"]
3. 检查数据库连接：`/sql_generator/check_db_connection`
  - 请求方式：post
  - 请求参数：{ "dbType": "mysql", "host": "localhost", "port": "3306", "database": "testDatabase", "username": "testUser", "password": "testPassword" }
  - 返回结果：{ "status": "success" } 或 { "status": "error", "message": "数据库连接失败" }
4. 获取指定表的所有字段：`/sql_generator/table_columns`
   - 请求方式：post
   - 请求参数：{ "dbType": "mysql", "host": "localhost", "port": "3306", "database": "testDatabase", "username": "testUser", "password": "testPassword", "tableName": "table1" }
   - 返回结果：[{"Column_Name": "id", "Comment": "test"}, {"Column_Name": "name", "Comment": "test"}, {"Column_Name": "age", "Comment": "test"}]
5. 获取生成的prompt内容：`/sql_generator/db_prompts`
  - 请求方式：post
  - 请求参数：{ "dbType": "mysql", "host": "localhost", "port": "3306", "database": "testDatabase", "username": "testUser", "password": "testPassword", "tableNames": ["table1", "table2", "table3"], "businessRequirement": "查找价格大于100的产品id，名称，sku和供应商名称" }
  - 返回结果：{"db_info": "MySQL 8.0.42", "table_info": "表信息：\n表名：product:\n表字段信息：\nid: bigint (不可为空, 键类型: PRI)\nprice: decimal(10,2) (不可为空, 键类型: MUL)"}

## MVP 1.0.0
1. 创建一个child module and routing, 命名为sql-generator，用来存放sql-generator相关的代码
2. 创建一个angular component，命名为sql-generator，用来展示sql-generator模块的页面
3. 页面分为左右两部分，左边是一个表单（固定宽度450px），右边是一个结果显示区域用来显示生成的prompt内容
4. 左侧表单包含以下字段：
   - 数据库连接：(section标题)，以下所有字段都为必填字段
     - 数据库类型：下来列表，来自api结果，默认为mysql
     - 数据库地址：输入框
     - 数据库端口：输入框
     - 数据库名称：输入框
     - 数据库用户名：输入框
     - 数据库密码：输入框（密码框，加密存储）
     - 数据库"连接"按钮:
        - 只有所有必填字段都填写，才可点击
        - 点击按钮后，根据输入的参数，数据库连接，如果连接成功，则显示连接成功，如果连接失败，则显示连接失败
        - 如果数据库连接成功，则获取所有表，并显示在表单中，用户可以动态添加多个表，也可以删除
   - 用到的表：用户可以动态添加多个表，也可以删除
     - 表名：可搜索的下拉框，options来自api结果，默认为空
   - 查询要求：文本区域，用户一些placeholder，用户可以输入一些查询要求
     - placeholder：查询目标，过滤条件，排序，分页信息
   - "生成"按钮：点击按钮后，根据表单中的数据，发送API生成prompt内容，并显示在右侧的结果显示区域
5. prompt内容显示区域：
   - 显示生成的prompt内容，通过<pre>标签显示
   - 该区域右上角显示copy按钮，点击按钮后，将生成的prompt内容复制到剪贴板

## MVP 1.0.1
基于现有的代码，添加以下功能，不修改跟以下需求无关的内容：
1. 在Business Requirement下面添加一段副标题提示，提示用户可以输入一些查询要求，文案如下：Please enter the requirement such as query column names, filter conditions, sort, and pagination information. 
2. 在Table(s) to be Used和Business Requirement之间添加一个field，名字叫“操作类型”，nz-segmented的options为“查询”和“优化”，默认为“查询”
    - 对应的在api参数name为"operationType"，值为"query"和"optimize"
    - 获取生成的prompt内容的API有变化：`/sql_generator/db_prompts`
        - 请求参数：{ "dbType": "mysql", "host": "localhost", "port": "3306", "database": "testDatabase", "username": "testUser", "password": "testPassword", "tableNames": ["table1", "table2", "table3"], "operationType": "query", "businessRequirement": "查找价格大于100的产品id，名称，sku和供应商名称" }

## MVP 1.0.2
基于现有的代码，添加以下功能，不修改跟以下需求无关的内容：
1. 在“Generate”按钮上面添加一个field, “Existing SQL”，type为textarea，必填字段，placeholder为“请输入现有的SQL”，用户可以输入一些现有的SQL，用于优化”
2. 当用户选择optimize时，将显示Existing SQL, 隐藏Business Requirement，反之亦然
3. 获取生成的prompt内容的API有变化：`/sql_generator/db_prompts`
    - 添加请求参数：{ "existingSql": "请输入现有的SQL" }
4. 隐藏的字段不需要提交给API
