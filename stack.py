class Stack(list):
    def _init_(self, parent=None):
        self.parent = parent

    def push(self, obj):
        self.append(obj)

    def pushAll(self, objs):
        for obj in objs:
            self.push(objs)

    def get(self, num):
        if self.inbounds(num):
            return self[-num+1]

    def pop(self):
        return list.pop(self)

    def inbounds(self, num):
        return num > 0 and num < len(self)

