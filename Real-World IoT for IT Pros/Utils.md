## Installing iothub-explorer

> Note: This tool requires Node.js version 4.x or higher for all features to work.

To install the latest version of the **iothub-explorer** tool, run the following command in your command-line environment:


```shell
npm install -g iothub-explorer
```




Supply your IoT hub connection string once using the **login** command. This means you do not need to supply the connection string for subsequent commands for the duration of the session (defaults to one hour):

```shell
$ iothub-explorer login "HostName=<my-hub>.azure-devices.net;SharedAccessKeyName=<my-policy>;SharedAccessKey=<my-policy-key>"

Session started, expires Fri Jan 15 2016 17:00:00 GMT-0800 (Pacific Standard Time)
```

