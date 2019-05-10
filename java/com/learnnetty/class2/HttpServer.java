package com.learnnetty.class2;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelInitializer;
import io.netty.channel.ChannelOption;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.codec.http.HttpObjectAggregator;
import io.netty.handler.codec.http.HttpRequestDecoder;
import io.netty.handler.codec.http.HttpResponseEncoder;
/**
 * Created by lz on 2019/3/4.
 */
//启动类，负责启动（BootStrap）和main方法
public class HttpServer {
    private final int port;

    public HttpServer(int port) {
        this.port = port;
    }

    public static void main(String[] args) throws Exception {
        if (args.length != 1) {
            System.err.println(
                    "Usage: " + HttpServer.class.getSimpleName() +
                            " <port>");
            return;
        }
        int port = Integer.parseInt(args[0]);//只允许有一个端口参数
        new HttpServer(port).start();
    }

    public void start() throws Exception {
        ServerBootstrap b = new ServerBootstrap();
        NioEventLoopGroup group = new NioEventLoopGroup();
        b.group(group)
                .channel(NioServerSocketChannel.class)
                .childHandler(new ChannelInitializer<SocketChannel>() {
                    //这里直接写了一个会话初始化器，也应该可以调用其他类里的会话初始化器
                    @Override
                    public void initChannel(SocketChannel ch)//看来ChannelInitializer是一个接口，需要实现initChannel方法
                            throws Exception {
                        System.out.println("initChannel ch:" + ch);
                        ch.pipeline()//向流水线里添加要执行的步骤
                                .addLast("decoder", new HttpRequestDecoder())   // 1 HttpRequestDecoder，用于解码request
                                .addLast("encoder", new HttpResponseEncoder())  // 2 HttpResponseEncoder，用于编码response
                                .addLast("aggregator", new HttpObjectAggregator(512 * 1024))//消息合并的数据大小，如此代表聚合的消息内容长度不超过512kb。
                                // 3 aggregator，消息聚合器（重要）
                                /*http的Request 和response 都可能由多个部分组成，FullHttpRequest是由所有的这些部分合成的一个对象
                                * 如果没有aggregator，那么一个http请求就会通过多个Channel被处理，*/
                                .addLast("handler", new HttpHandler());        // 4 添加我们自己的处理接口
                    }
                    /*事件传递给 ChannelPipeline 的第一个 ChannelHandler
                    *ChannelHandler 通过关联的 ChannelHandlerContext 传递事件给 ChannelPipeline 中的 下一个
                    *ChannelHandler 通过关联的 ChannelHandlerContext 传递事件给 ChannelPipeline 中的 下一个
                    * Decoder和Encoder，他们分别就是ChannelInboundHandler和ChannelOutboundHandler
                    * */
                })
                .option(ChannelOption.SO_BACKLOG, 128) // determining the number of connections queued排队的链接数
                .childOption(ChannelOption.SO_KEEPALIVE, Boolean.TRUE);// 长连接？多个会话之间不中断？

        b.bind(port).sync();//同步
    }
}
