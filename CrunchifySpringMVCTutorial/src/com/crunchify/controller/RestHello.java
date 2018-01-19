package com.crunchify.controller;

import java.util.concurrent.atomic.AtomicLong;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;

@RestController
public class RestHello {
	private static final String template = "Hello, %s!";
    private final AtomicLong counter = new AtomicLong();
    private Gson gson = new Gson();
    
    @RequestMapping("/greeting")
    public @ResponseBody String greeting(@RequestParam(value="name", defaultValue="World") String name) {
    	return gson.toJson(new Greeting(counter.incrementAndGet(), String.format("hello %s", name)));
    }
}
