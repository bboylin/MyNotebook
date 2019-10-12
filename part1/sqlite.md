sqlite存的db文件在/data/data/package/databases下，sp存的在/data/data/package/shared_prefs下。

如何查看？

未root手机需要在adb shell 调用run-as package才可访问`/data/data/package/`目录, apk需要是debug包，或者release 包反编译把manifest里的debuggable设为true 重新打包安装也行。([https://gist.github.com/nstarke/615ca3603fdded8aee47fab6f4917826](https://gist.github.com/nstarke/615ca3603fdded8aee47fab6f4917826))

将db文件pull到desktop 使用命令即可进行查看：
```
➜  ~ sqlite3 /Users/denglin03/Desktop/xx.db
SQLite version 3.24.0 2018-06-04 14:10:15
Enter ".help" for usage hints.
sqlite> .tables
table1  table2  table3  Cars
sqlite> .header on
sqlite> select * from table1;
.........
sqlite> .schema table1
CREATE TABLE table1(Id INTEGER PRIMARY KEY, Name TEXT, Price INTEGER);
sqlite> .dump Cars
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE Cars(Id INTEGER PRIMARY KEY, Name TEXT, Price INTEGER);
INSERT INTO "Cars" VALUES(1,'Audi',52642);
INSERT INTO "Cars" VALUES(2,'Mercedes',57127);
INSERT INTO "Cars" VALUES(3,'Skoda',9000);
INSERT INTO "Cars" VALUES(4,'Volvo',29000);
INSERT INTO "Cars" VALUES(5,'Bentley',350000);
INSERT INTO "Cars" VALUES(6,'Citroen',21000);
INSERT INTO "Cars" VALUES(7,'Hummer',41400);
INSERT INTO "Cars" VALUES(8,'Volkswagen',21600);
COMMIT;
```

更多命令输入`.help`或者参考[https://sqlite.org/cli.html](https://sqlite.org/cli.html)

推荐一个可视化网站：[https://sqliteonline.com/](https://sqliteonline.com/)

adb dump activity : `adb shell dumpsys activity activities | sed -En -e '/Running activities/,/Run #0/p'  `

more adb : [https://developer.android.com/studio/command-line/adb?hl=zh-cn#screencap](https://developer.android.com/studio/command-line/adb?hl=zh-cn#screencap)