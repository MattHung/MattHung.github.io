package com.libgdx.html5.gameframework;

import com.google.gwt.regexp.shared.RegExp;
import com.google.gwt.regexp.shared.SplitResult;

/**
 * Created by matt1201 on 2016/8/15.
 */
public class Utility {
    public static String formatString(final String format, final Object... args) {
        final RegExp regex = RegExp.compile("%[a-z]");
        final SplitResult split = regex.split(format);
        final StringBuffer msg = new StringBuffer();
        for (int pos = 0; pos < split.length() - 1; ++pos) {
            msg.append(split.get(pos));
            msg.append(args[pos].toString());
        }
        msg.append(split.get(split.length() - 1));
        return msg.toString();
    }
}
