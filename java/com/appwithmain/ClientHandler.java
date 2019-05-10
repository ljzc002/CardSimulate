package com.appwithmain;

import org.eclipse.swt.widgets.Text;

import java.io.*;

/**
 * Created by lz on 2019/3/22.
 */
public class ClientHandler implements Runnable {
    private String str_script;
    private Text text_log;
    private MyCmd window1;
    public String str_line;
    public String str_line2;
    //传参的好方法是使用构造函数
    public ClientHandler(String str_script, MyCmd mycmd){
        this.str_script=str_script;
        this.text_log=mycmd.text_log;
        mycmd.flag_runable=2;
        this.window1=mycmd;
    }
    public void run()
    {

        Runtime rt=Runtime.getRuntime();
        InputStream ins = null;
        InputStream ins2 = null;
        String[] cmd = new String[] { "C:\\Users\\lz\\Desktop\\18d报表\\d18front\\cmd.exe", "/C"
                , this.str_script };  // 命令
        int i=0;
        try {
            Process process = rt.exec(cmd);
            process.waitFor();
            ins = process.getInputStream();  // 获取执行cmd命令后的信息
            ins2=process.getErrorStream();
            BufferedReader reader = new BufferedReader(new InputStreamReader(ins));
            BufferedReader reader2 = new BufferedReader(new InputStreamReader(ins2));
            //String line = null;
            //这里如果设置watch的话，会消耗掉一行输出
            while ((str_line = reader.readLine()) != null)
            {
                System.out.println(str_line);

                window1.display.getDefault().syncExec(new Runnable()
                {//这是获取了主线程的操作权？其持续性导致主线程无法工作！！
                    public void run()
                    {
                        window1.text_log.append("\n"+str_line);
                        //int_starttime=window1.scale2.getSelection();
                    }
                });
                //如果发现启动失败，则去下载缺少的包
                int int_error=str_line.indexOf("Error: Cannot find module");
                if(int_error>=0)
                {
                    String str_modname=str_line.substring(int_error+25).replaceAll("'","");
                    System.out.println("str_modname:"+str_modname);
                    //用新的线程执行JNI操作
                    Runnable handler=new ClientHandler("cnpm install "+str_modname,window1);
                    Thread t=new Thread(handler);
                    t.start();
                    break;
                }
                else if (this.str_script.indexOf("cnpm install")>=0)
                {
                    System.out.println("Try cnpm start");
                    //用新的线程执行JNI操作
                    Runnable handler=new ClientHandler("cnpm start",window1);
                    Thread t=new Thread(handler);
                    t.start();
                    break;
                }
            }
            while ((str_line2 = reader2.readLine()) != null) {
                System.out.println(str_line2);
                window1.display.getDefault().syncExec(new Runnable() {//这是获取了主线程的操作权？其持续性导致主线程无法工作！！
                    public void run() {
                        String str_error="";
                        try {
                            //byte[] bytes = str_line2.getBytes("gbk");
                            //byte[] bytes2 = new String(bytes, "gbk").getBytes("utf-8");
                            str_error=new String(str_line2.getBytes("gbk"), "utf-8");
                        } catch (UnsupportedEncodingException e) {
                            e.printStackTrace();
                        }
                        window1.text_log.append("\n" + str_error);
                        //int_starttime=window1.scale2.getSelection();
                    }
                });
                int int_error=str_line2.indexOf("Error: Cannot find module");
                if(int_error>=0)
                {
                    String str_modname=str_line2.substring(int_error+25).replaceAll("'","");
                    System.out.println("str_modname:"+str_modname);
                    //用新的线程执行JNI操作
                    Runnable handler=new ClientHandler("cnpm install "+str_modname,window1);
                    Thread t=new Thread(handler);
                    t.start();
                    break;
                }
                else if (this.str_script.indexOf("cnpm install")>=0)
                {
                    System.out.println("Try cnpm start");
                    //用新的线程执行JNI操作
                    Runnable handler=new ClientHandler("cnpm start",window1);
                    Thread t=new Thread(handler);
                    t.start();
                    break;
                }
            }
            //int exitValue = process.waitFor();
            //System.out.println("返回值：" + exitValue);
            reader.close();
            reader2.close();
            window1.flag_runable=0;
            process.getOutputStream().close();  // 不要忘记了一定要关
            ins.close();
            ins2.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    /*但是waitFor()方法也有很明显的弊端，因为java程序给进程的输出流分配的缓冲区是很小的，有时候当进程输出信息很大的时候回导致缓冲区被填满，如果不及时处理程序会阻塞。如果程序没有对进程的输出流处理的会就会导致执行exec()的线程永远阻塞，进程也不会执行下去直到输出流被处理或者java程序结束。

解决的方法就是处理缓冲区中的信息，开两个线程分别去处理标准输出流和错误输出流。*/
    /*printMessage(process.getInputStream(),window1);
    　　printMessage(process.getErrorStream(),window1);*/
      public static String line;
      //开启检查cmd命令输出的窗口
      //获取的输入流，主窗口，父线程执行的脚本内容
    private static void printMessage(final InputStream input,MyCmd window1,String str_script)
    {
        new Thread(new Runnable()
        {
            public void run()
            {
                Reader reader = new InputStreamReader(input);
                BufferedReader bf = new BufferedReader(reader);
                //String line = null;
                  try {
                    while((line=bf.readLine())!=null) {
                        System.out.println(line);
                        window1.display.getDefault().syncExec(new Runnable()
                        {//这是获取了主线程的操作权？其持续性导致主线程无法工作！！
                            public void run()
                            {
                                window1.text_log.append("\n"+line);
                                //int_starttime=window1.scale2.getSelection();
                            }
                        });
                        //假设这样可以确保正确的输出，但又如何在这两个新开的子线程中发现标志时去控制父线程的工作呢？
                        int int_error=line.indexOf("Error: Cannot find module");
                        if(int_error>=0)
                        {
                            String str_modname=line.substring(int_error+25).replaceAll("'","");
                            System.out.println("str_modname:"+str_modname);
                            //用新的线程执行JNI操作
                            Runnable handler=new ClientHandler("cnpm install "+str_modname,window1);
                            Thread t=new Thread(handler);
                            t.start();
                            break;
                        }
                        else if (str_script.indexOf("cnpm install")>=0)
                        {
                            System.out.println("Try cnpm start");
                            //用新的线程执行JNI操作
                            Runnable handler=new ClientHandler("cnpm start",window1);
                            Thread t=new Thread(handler);
                            t.start();
                            break;
                        }
                    }
                 } catch (IOException e) {
                    e.printStackTrace();
                  }
            }
        }).start();
    }
}
