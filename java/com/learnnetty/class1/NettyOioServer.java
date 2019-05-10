package com.learnnetty.class1;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.channel.oio.OioEventLoopGroup;
import io.netty.channel.socket.SocketChannel;
import io.netty.channel.socket.oio.OioServerSocketChannel;

import java.net.InetSocketAddress;
import java.nio.charset.Charset;

/**
 * Created by lz on 2019/3/4.
 */
public class NettyOioServer {
    public void server(int port) throws Exception {
        final ByteBuf buf = Unpooled.unreleasableBuffer(//分配一段不会回收的非堆内存
                Unpooled.copiedBuffer("Hi!\r\n", Charset.forName("UTF-8")));
        //ByteBuf是一个存储字节的容器，最大特点就是使用方便，它既有自己的读索引和写索引，方便你对整段字节缓存进行读写，也支持get/set，方便你对其中每一个字节进行读写
        EventLoopGroup group = new OioEventLoopGroup();
        try {
            ServerBootstrap b = new ServerBootstrap();        //1

            b.group(group)                                    //2
                    .channel(OioServerSocketChannel.class)
                    //Channel，表示一个连接，可以理解为每一个请求，就是一个Channel。
                    //一次http请求并不是通过一次对话完成的，他中间可能有很次的连接。每一次对话都会建立一个channel
                    .localAddress(new InetSocketAddress(port))
                    .childHandler(new ChannelInitializer<SocketChannel>() {//3ChannelHandler，核心处理业务就在这里，用于处理业务请求。
                        @Override
                        public void initChannel(SocketChannel ch)
                                throws Exception {
                            ch.pipeline().addLast(new ChannelInboundHandlerAdapter() {
                                //4 ChannelPipeline，用于保存处理过程需要用到的ChannelHandler和ChannelHandlerContext。
                                @Override
                                public void channelActive(ChannelHandlerContext ctx) throws Exception
                                {//ChannelHandlerContext，用于传输业务数据。
                                    ctx.writeAndFlush(buf.duplicate()).addListener(ChannelFutureListener.CLOSE);//5
                                }
                            });
                        }
                    });
            ChannelFuture f = b.bind().sync();  //6
            f.channel().closeFuture().sync();
        } finally {
            group.shutdownGracefully().sync();        //7
        }
    }
}
