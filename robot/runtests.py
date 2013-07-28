#! /usr/bin/env python

"""
Examples:
  python rundemo.py tests                       # Run all tests

Running the tests requires that Robot Framework, Selenium2Library, Python, and
Java to be installed. For more comprehensive instructions, see the demo wiki
page at `http://code.google.com/p/robotframework-selenium2library/wiki/Demo`.
"""

import os
import sys
from tempfile import TemporaryFile
from subprocess import Popen, call, STDOUT

try:
    import Selenium2Library
except ImportError, e:
    print 'Importing Selenium2Library module failed (%s).' % e
    print 'Please make sure you have Selenium2Library properly installed.'
    print 'See INSTALL.rst for troubleshooting information.'
    sys.exit(1)


ROOT = os.path.dirname(os.path.abspath(__file__))

def run_tests(args):
    # start_selenium_server()
    return call(['pybot'] + args, shell=(os.sep == '\\'))
    # stop_selenium_server()

def start_selenium_server():
    logfile = open(os.path.join(ROOT, 'selenium_log.txt'), 'w')
    Selenium2Library.start_selenium_server(logfile)

def stop_selenium_server():
    Selenium2Library.shut_down_selenium_server()

def print_usage():
    print 'Usage: rundemo.py [test_dir]'
    print '   or: rundemo.py selenium-start'
    print '   or: rundemo.py selenium-stop'
    print '   or: rundemo.py --exclude github tests/'
    print '   or: rundemo.py --variable GITHUB_USERNAME:[username]'
    print '         --variable GITHUB_PASSWORD:[password] tests/'
    print '   or: rundemo.py --variable GITHUB_USERNAME:[username]'
    print '         --variable GITHUB_PASSWORD:[password]'
    print '         --variable SERVER:[server] tests/'


if __name__ == '__main__':
    action = {'selenium-start': start_selenium_server,
              'selenium-stop': stop_selenium_server,
              '': print_usage}.get('-'.join(sys.argv[1:]))
    if action:
        action()
    else:
        sys.exit(run_tests(sys.argv[1:]))
