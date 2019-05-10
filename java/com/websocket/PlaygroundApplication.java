package com.websocket;

import com.alibaba.druid.pool.DruidDataSource;
import com.websocket.netty.NettyConfig;
import com.websocket.netty.ServerBootStrap;
import io.netty.channel.ChannelFuture;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.jdbc.core.JdbcTemplate;

import java.net.InetSocketAddress;

//整个sb2程序的入口
//事实上CommandLineRunner接口和ApplicationRunner接口是在容器启动完成后执行的，并不是真正的程序入口！！
@SpringBootApplication
public class PlaygroundApplication implements CommandLineRunner {

	@Autowired
	private ServerBootStrap ws;
	//@Autowired
	//public static JdbcTemplate jdbcTemplateWS;
	public static DruidDataSource ds ;


	public static void main(String[] args) {
		ds  = new DruidDataSource();
		ds.setDriverClassName("org.h2.Driver");
		ds.setUrl("jdbc:h2:tcp://127.0.0.1/../../playground");
		ds.setUsername("playground");
		ds.setPassword("playground");
		ds.setMaxActive(100);

		SpringApplication.run(PlaygroundApplication.class, args);//开始springboot的逻辑循环，
		//后面的代码将不会执行

	}
	// 注意这里的 run 方法是重载自 CommandLineRunner
	@Override
	public void run(String... args) throws Exception {
		System.out.print("Netty开始监听："+NettyConfig.WS_PORT);
		InetSocketAddress address = new InetSocketAddress(NettyConfig.WS_HOST, NettyConfig.WS_PORT);
		ChannelFuture future = ws.start(address);

		Runtime.getRuntime().addShutdownHook(new Thread(){
			@Override
			public void run() {
				ws.destroy();
			}
		});

		future.channel().closeFuture().syncUninterruptibly();


	}
}
