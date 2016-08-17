package com.libgdx.html5.gameframework;

import java.util.LinkedList;
import java.util.List;

/**
 * Created by matt1201 on 2016/5/26.
 */
public class DebugMessage {
    static class ErrorContent{
        public Throwable E;
        public String Stack;
        public ErrorContent(Throwable e, String stack){
            E = e;
            Stack = stack;
        }
    }


    private static String getStackTraceInternal(Throwable e){
        String text = Utility.formatString("．Exception:  %s\r\n",e.toString());
        StackTraceElement[] stack = e.getStackTrace();

        text += Utility.formatString("  Stacks:\r\n");
        for(int i =0; i<stack.length; i++)
            text +=Utility.formatString("   %s\r\n", stack[i].toString());

        return text;
    }

    public static String getStackTrace(Throwable e) {
        List<Throwable> exception_stack = new LinkedList<Throwable>();

        String text = "";

        while (e != null) {
            exception_stack.add(e);
            e = e.getCause();
        }

        for(int i = exception_stack.size()-1; i>=0; i--)
            text += getStackTraceInternal(exception_stack.get(i));

        return text;
    }
}
