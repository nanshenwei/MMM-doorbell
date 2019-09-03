import tornado.websocket
import tornado.httpserver
import tornado.ioloop
import tornado.web
import tornado.gen

import multiprocessing as mp
import psutil

import time

import numpy as np
import cv2

class WebSocketServer(tornado.websocket.WebSocketHandler):

    def install_cap(self):
        try:
            self.cap.release()
        except:
            print("FAILED TO RELEASE cap")

        self.faceCascade = cv2.CascadeClassifier('Cascades/haarcascade_frontalface_default.xml')
        self.cap = cv2.VideoCapture(0)
        self.cap.set(3,640) # set Width
        self.cap.set(4,480) # set Height

    def check_origin(self, origin):
        return True
        
    def open(self):
        print('OPENED')

    def on_message(self, message):
        print('GOT MESSAGE: {}'.format(message))
        if message == 'START':
            try:
                self.p1.terminate()
                self.p1.join()
            except:
                print("FAILED TO KILL p1")
            self.start_isface()
            
    def on_close(self):
        print('CLOSE')
        self.stop_isface()

    def start_isface(self):
        def is_face(self):
            self.install_cap()
            run = True
            print('RUNING')
            while run:
                ret, img = self.cap.read()
                if ret:
                    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
                    faces = self.faceCascade.detectMultiScale(
                        gray,     
                        scaleFactor=1.2,
                        minNeighbors=5,     
                        minSize=(20, 20)
                    )
                    if len(faces):
                        print('IS_A_FACE')
                        # import shutil, os
                        # shutil.rmtree('/home/pi/share/temp/')
                        # os.mkdir('/home/pi/share/temp/')
                        file_path_name = str(time.time()) + '.png'
                        file_path='/home/pi/MagicMirror/modules/MMM-Doorbell/temp/'+file_path_name
                        if cv2.imwrite(file_path, img):
                            self.write_message('IS_A_FACE:'+'temp/'+file_path_name)
                            run = False
                #time.sleep(0.5)

        self.p1 = mp.Process(target=is_face,args=(self,))
        self.p1.start()
        self.write_message('RUNING')

    def stop_isface(self):
        try:
            self.p1.terminate()
            self.p1.join()
            print("KILLED")
        except:
            print("FAILED TO KILL p1 IN stop_isface()")


if __name__ == '__main__':
    app = tornado.web.Application([
            (r'/', WebSocketServer)
        ])
    http_server = tornado.httpserver.HTTPServer(app)
    http_server.listen(16666)
    tornado.ioloop.IOLoop.instance().start()