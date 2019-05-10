package com.appwithmain;

import org.eclipse.swt.*;
import org.eclipse.swt.widgets.*;
import org.eclipse.swt.layout.*;
import org.eclipse.swt.graphics.*;
import org.eclipse.swt.custom.ScrolledComposite;
import org.eclipse.swt.custom.StackLayout;
import org.eclipse.swt.events.*;

/**
 * Created by lz on 2019/3/22.
 * 窗口程序，用来自定义cmd的执行
 */
public class MyCmd extends Shell {
    //-start
    protected Display display;
    protected Shell shell;
    protected Menu menubar;
    protected Composite composite;
    //protected SwtEmbeddedMediaPlayer mediaPlayer;
    protected int win_height=768;
    protected int win_width=800;
    //堆栈选项卡的信息，SWT不能垂直选择元素，也不能动态添加属性，目前只能为每个要用到的对象在顶层保存指针
    public Composite comp_up_log;
    public Composite comp_down_input;
    public Text text_log;
    public Text text_input;
    public int flag_runable=0;//为1时允许脚本流水线工作
    public String script_current="";//当前要执行的脚本
    public int count_run=0;//当前执行次数

    /*	  * 主函数入口	  * */
    public static void main(String[] args)
    {
        final Display display=new Display();

        MyCmd window1 = new MyCmd(display);
        window1.layout();	//重新进行一次排版，否则复杂的窗口内容无法显示
        //检测窗口渲染状态
        while(!window1.isDisposed())
        {
            if(!display.readAndDispatch())
            {
                display.sleep();//程序运行着，但渲染休眠了
            }
        }
        display.dispose();
    }
    public MyCmd(Display display)
    {
        super(display);//父类构造
        checkSubclass();
        this.display=display;
        this.shell=this;
        this.setSize(win_width, win_height);
        this.setMinimumSize(win_width, win_height);
        //this.setBackgroundMode(SWT.INHERIT_DEFAULT); //强制继承背景色
        setLayout(new FillLayout());
        setText("Salted Fish");
        open();

        //添加退出处理
        this.addShellListener(new ShellAdapter()
        {
            public void shellClosed(ShellEvent e) {
                MessageBox mb = new MessageBox(shell, SWT.ICON_QUESTION | SWT.OK | SWT.CANCEL);
                mb.setText("Confirm Exit");
                mb.setMessage("Are you sure you want to exit?");
                int rc = mb.open();
                if(rc == SWT.OK)
                {
                    e.doit =true;
                    System.exit(0);//关闭JVM虚拟机？？
                }
                else
                {
                    e.doit =false;
                }
            }
        });

        //list_sf=new ArrayList<Obj_sf>();
        CreateMenuBar();
        CreateComposite();
    }
    //为了解决shell不能被继承的问题
    protected void checkSubclass(){  }
    //省略窗口上部的菜单条
    private void CreateMenuBar()	 {}
    //建立窗口主体空间
    private void CreateComposite()
    {
        Composite composite=new Composite(this,SWT.NONE);//主体空间中首先要有一个填满空间的容器
        this.composite=composite;
        //composite.setLayout(new FillLayout(SWT.VERTICAL));//能够遗传给内部元素吗？
        //实验证明不遗传，并且设置了它之后会强行取代设置的具体位置和尺寸
        initGui();
    }
    //分割主窗体
    protected void initGui()
    {
        Font font = new Font(display, "Arial", 14, SWT.BOLD | SWT.ITALIC);
        //上面是运行状态显示区
        this.comp_up_log=new Composite(composite,SWT.BORDER);
        comp_up_log.setBounds(0,0, win_width, 400);
        this.text_log=new Text(comp_up_log,SWT.LEFT|SWT.BORDER| SWT.MULTI);
        //text_log.setTextLimit(100);
        text_log.setToolTipText("");
        text_log.setBounds(50, 10, win_width-100, 380);

        //下面是脚本输入区
        this.comp_down_input=new Composite(composite,SWT.BORDER);
        comp_down_input.setBounds(0,420, win_width, 300);
        this.text_input=new Text(comp_down_input,SWT.LEFT|SWT.BORDER| SWT.MULTI);
        //text_log.setTextLimit(100);
        text_input.setToolTipText("");
        text_input.setBounds(50, 10, win_width-100, 280);

        Button btn_start=new Button(comp_down_input,SWT.PUSH);
        btn_start.setText(">");
        Event_cb.registerCallback(btn_start,this,"StartRun");
        btn_start.setBounds(win_width-40,10, 30, 26);
        Button btn_pause=new Button(comp_down_input,SWT.PUSH);
        btn_pause.setText("||");
        Event_cb.registerCallback(btn_pause,this,"PauseRun");
        btn_pause.setBounds(win_width-40,50, 30, 26);
    }

    public void StartRun()//允许运行
    {
        if(flag_runable==1)//如果当前允许运行但没有正在运行的
        {
            return;
        }
        else if(flag_runable==2)//如果正在运行
        {
            return;
        }
        else
        {//如果当前没有运行则将运行标志置为1，并开始运行
            flag_runable=1;
        }
        if(count_run==0)
        {
            script_current=text_input.getText();
        }
        text_log.append("\n"+script_current);
        //用新的线程执行JNI操作
        Runnable handler=new ClientHandler(script_current,this);
        Thread t=new Thread(handler);
        t.start();
    }
    public void PauseRun()
    {

    }
}
