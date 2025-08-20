import { Injectable } from '@angular/core';
import { fabric } from 'fabric';
import { CanvasMarkerPopup, UIMarkerRect } from '../../types/ui-marker-type';
import { SharedStoreService } from './shared-store.service';
import { PAGE_VIEW_TYPES, UI_MARKER_SETTINGS } from '../../consts/sys-consts';

declare module 'fabric' {
  namespace fabric {
    interface Object {
      id?: string;
    }
  }
}

@Injectable({
  providedIn: 'root'
})

export class CanvasToolService {

  constructor(
    private sharedStoreService: SharedStoreService
  ) {}

  private canvas: fabric.Canvas | undefined;
  private rect: UIMarkerRect | null = null;
  private isDrawing = false;
  private isDrawn = false; // identify if custoer has drawed something
  private origX = 0;
  private origY = 0;
  private canvasHeight = 0;

  private lastClickTime: number = 0;
  private DOUBLE_CLICK_DELAY: number = 300; // milliseconds

  private rectMinWidth: number = 10;
  private rectMinHeight: number = 10;
  private rectMoveMinWidth: number = 3;
  private rectMoveMinHeight: number = 3;
  private canvasWidth: number = UI_MARKER_SETTINGS.CANVAS_WIDTH;

  private initialLeft: number = 0;
  private initialTop: number = 0;
  private initialWidth: number = 0;
  private initialHeight: number = 0;
  private canvasEditable: boolean = false;

  initCanvas(backgroundImageUrl: string, pageViewType?: string, editable: boolean = false) {
    this.canvasEditable = editable;
    // set canvasWidth for different view
    this.canvasWidth = pageViewType === PAGE_VIEW_TYPES[1] ? UI_MARKER_SETTINGS.CANVAS_WIDTH_MOBOLE_VIEW : UI_MARKER_SETTINGS.CANVAS_WIDTH;

    // Modify the Fabric.js object prototype
    (fabric.Object.prototype.toObject as any) = ((toObject) => {
      return function (this: fabric.Object) {
        return fabric.util.object.extend(toObject.call(this), {
          id: this.id
        });
      };
    })((fabric.Object.prototype.toObject as any));

    // Create a new fabric.Canvas instance
    this.canvas = new fabric.Canvas('canvas');
    
    // set background image
    this.loadBackgroundImg(backgroundImageUrl);
  }

  loadBackgroundImg(backgroundImageUrl: string) {
    fabric.Image.fromURL(backgroundImageUrl, (img) => {
      this.canvasHeight = this.canvasWidth * (img.height! / img.width!);
      // set the width and heigth of the canvas
      this.canvas!.setWidth(this.canvasWidth);
      this.canvas!.setHeight(this.canvasHeight);
      this.canvas!.setBackgroundImage(img, this.canvas!.renderAll.bind(this.canvas!), {
        scaleX: this.canvasWidth / img.width!,
        scaleY: this.canvasHeight / img.height!
      });
    });
  }

  //render rect details if exists
  loadMarkerDetails(rectString: string): void {
    if (rectString) {
      const rects = (typeof(rectString) === 'string') ? JSON.parse(rectString) : rectString;
      for (const rect of rects) {
        const newRect = new fabric.Rect(rect);
        if (!this.canvasEditable) {
          newRect.set({
            lockMovementX: true,
            lockMovementY: true,
            lockScalingX: true,
            lockScalingY: true,
            lockRotation: true,
            lockUniScaling: true,
          });
        }
        this.canvas!.add(newRect);
        this.canvas!.renderAll();
      }
    } else {
      this.canvas!.renderAll();
    }
  }

  hasActiveObject() {
    return this.canvas!.getActiveObject() ? true : false;
  }

  updateInitialRectValues(activeObject: fabric.Object) {
    if (activeObject) {
      this.initialLeft = activeObject.left || 0;
      this.initialTop = activeObject.top || 0;
      this.initialWidth = (activeObject.width || 0) * (activeObject.scaleX || 0);
      this.initialHeight = (activeObject.height || 0) * (activeObject.scaleY || 0);
    }
  }

  // this function is to avoid tiny movement of the rectangle
  checkIfTinyMovement(activeObject: any) {
    if (activeObject) {
      const currentLeft = activeObject.left || 0;
      const currentTop = activeObject.top || 0;
      const currentWidth = (activeObject.width || 0) * (activeObject.scaleX || 0);
      const currentHeight = (activeObject.height || 0) * (activeObject.scaleY || 0);

      const leftDiff = Math.abs(currentLeft - this.initialLeft);
      const topDiff = Math.abs(currentTop - this.initialTop);

      if (currentWidth === this.initialWidth && currentHeight === this.initialHeight 
        && leftDiff < this.rectMoveMinWidth && topDiff < this.rectMoveMinHeight) {
        // Revert to initial position if changes are insignificant
        activeObject.set({
          left: this.initialLeft,
          top: this.initialTop
        });
        activeObject.setCoords();
        this.canvas!.renderAll();
        return true;
      }
      return false;
    }
    return true;
  }

  // Utility function to delay execution
  delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // set active rect by id
  async activeRectById(rectId: string) {
    const timeout = 5000; // 5 seconds
    const interval = 500; // Check every 500 milliseconds
    let elapsed = 0;

    while (elapsed < timeout) {
      const activeObject = this.canvas!.getObjects().find((obj) => obj.id === rectId);
      if (activeObject) {
        this.canvas!.setActiveObject(activeObject);
        this.canvas!.renderAll();
        this.setCanvasMarkerPopupAction(activeObject);
        return;
      }
      await this.delay(interval);
      elapsed += interval;
    }
  }

  initDrawableEvents() {
    this.canvas!.on('mouse:down', (o) => {
      if (!this.canvasEditable) {
        return;
      }
      this.isDrawing = true;
      const activeObject = this.canvas!.getActiveObject();
      if(activeObject && activeObject.type === 'rect') {
        console.log("select on existing rectangle");
        // set the rect init value
        this.updateInitialRectValues(activeObject);
      } else {
        if (activeObject) {
          console.log("there's an active object, don't start drawing a new rectangle");
          return;
        }
        const pointer = this.canvas!.getPointer(o.e);
        if (pointer.x > 0 && pointer.x <= this.canvasWidth && pointer.y > 0) {
          console.log("start to draw a new rectangle");
          this.origX = pointer.x;
          this.origY = pointer.y;
          this.newRect();
        }
      }
    });

    this.canvas!.on('mouse:move', (o) => {
      if (!this.canvasEditable) {
        return;
      }
      if (!this.isDrawing) return;
      this.isDrawn = true;
      const activeObject = this.canvas!.getActiveObject();
      if (!activeObject) {
        console.log("drawing a new rect");
        const pointer = this.canvas!.getPointer(o.e);
        // set the left and width
        if(pointer.x < 0) {
          this.rect!.set({ left: 0 });
          this.rect!.set({ width: Math.abs(this.origX) });
        } else if(pointer.x > this.canvasWidth) {
          this.rect!.set({ left: Math.abs(this.origX) });
          this.rect!.set({ width: Math.abs(this.origX - this.canvasWidth) });
        } else if(this.origX > pointer.x){
          this.rect!.set({ left: Math.abs(pointer.x) });
          this.rect!.set({ width: Math.abs(this.origX - pointer.x) });
        } else {
          this.rect!.set({ left: Math.abs(this.origX) });
          this.rect!.set({ width: Math.abs(this.origX - pointer.x) });
        }
        // set the top and height
        if(pointer.y < 0) {
          this.rect!.set({ top: 0 });
          this.rect!.set({ height: Math.abs(this.origY) });
        } else if(pointer.y > this.canvasHeight) {
          this.rect!.set({ top: Math.abs(this.origY) });
          this.rect!.set({ height: Math.abs(this.origY - this.canvasHeight) });
        } else if(this.origY > pointer.y){
          this.rect!.set({ top: Math.abs(pointer.y) });
          this.rect!.set({ height: Math.abs(this.origY - pointer.y) });
        } else {
          this.rect!.set({ top: Math.abs(this.origY) });
          this.rect!.set({ height: Math.abs(this.origY - pointer.y) });
        }
      } else {
        console.log("editing existing rect");
      }
    });

    this.canvas!.on('mouse:up', (o) => {
      if (!this.canvasEditable) {
        return;
      }
      this.isDrawing = false;
      if (this.isDrawn) {
        const activeObject = this.canvas!.getActiveObject();
        // this is for drawing a new rect case, If the rectangle's width or height is greater than 10, add it
        if (!activeObject && this.rect && this.rect!.width! > this.rectMinWidth && this.rect!.height! > this.rectMinHeight) {
          console.log("just drew a new rectangle");
          this.canvas!.add(this.rect as UIMarkerRect);
          this.rect?.render(this.canvas!.getContext());
          this.rect = null;
        
          this.updateCanvasMarkerDetails();
        }
        this.isDrawn = false;
      }
    });

    // this event is for rectangle move and resize
    this.canvas!.on('object:modified', (e) => {
      if (!this.canvasEditable) {
        return;
      }
      const obj = e.target;
      if (obj && obj.type === 'rect') {
        // if it's tiny movement case, do nothing
        if (this.checkIfTinyMovement(obj)) {
          return;
        }
        if (obj.left! < 0) {
          obj.left = 0;
        } else if ((obj.left! + obj.width!) > this.canvasWidth) {
          obj.left = this.canvasWidth - obj.width!;
        }
        if (obj.top! < 0) {
          obj.top = 0;
        } else if ((obj.top! + obj.height!) > this.canvasHeight) {
          obj.top = this.canvasHeight - obj.height!;
        }
        const width = obj.width! * obj.scaleX!;
        const height = obj.height! * obj.scaleY!;
    
        if (width < this.rectMinWidth || height < this.rectMinHeight) {
          console.log("the rectangle re-sized too small, remove it");
          this.canvas!.remove(obj);
          this.canvas!.renderAll();
        }
        
        this.updateCanvasMarkerDetails();
        console.log("updated a new rectangle using object:modified");

      }
    });
  }

  updateCanvasMarkerDetails() {
    const rectJson = this.convertCavasToJson();
    this.sharedStoreService.setCanvasMarkerDetails(JSON.stringify(rectJson));
  }

  // init a rect
  newRect(): void {
    this.rect = new fabric.Rect({
      left: this.origX,
      top: this.origY,
      originX: 'left',
      originY: 'top',
      width: 0,
      height: 0,
      stroke: 'red',
      strokeWidth: 2,
      fill: 'transparent',
    });
    this.rect.set({id: 'rect_' + new Date().getTime()});
    if (!this.canvasEditable) {
      this.rect.set({
        lockMovementX: true,
        lockMovementY: true,
        lockScalingX: true,
        lockScalingY: true,
        lockRotation: true,
        lockUniScaling: true,
      });
    }
  }

  // handleRemoveEvent(event: KeyboardEvent) {
  //   if (event.key === 'Backspace' || event.key === 'Delete') {
  //     this.removeActiveRect();
  //   }
  // }

  removeActiveRect() {
    const activeObject = this.canvas!!.getActiveObject();
    if (activeObject && activeObject.type === 'rect') {
      this.canvas!.remove(activeObject);
      this.canvas!.renderAll();

      this.updateCanvasMarkerDetails();
    }
  }

  convertCavasToJson(): UIMarkerRect[] | null {
    if (this.canvas) {
      const canvasJson = this.canvas!.toJSON();
      // if canvasJson is empty, do nothiing
      if (canvasJson.objects.length === 0) {
        return null;
      }
      return canvasJson.objects;
    }
    return null;
  }

  setDoubleClickRectIdToViewMarkerDetails() {
    const activeObject: UIMarkerRect = this.canvas!.getActiveObject() as UIMarkerRect;
    if (activeObject && activeObject.type === 'rect' && activeObject.id) {
      this.sharedStoreService.setDoubleClickRectId(activeObject.id);
    }
  }

  monitorDetailsPoopup() {
    this.canvas!.on('mouse:down', (o) => {
      const activeObject: UIMarkerRect = this.canvas!.getActiveObject() as UIMarkerRect;
      if (activeObject && activeObject.type === 'rect') {
        this.sharedStoreService.setSelectedRectId(activeObject.id as string);
        const currentTime = new Date().getTime();
        if (activeObject.id && (currentTime - this.lastClickTime) < this.DOUBLE_CLICK_DELAY) {
          // Double click detected
          console.log(activeObject.id);
          this.sharedStoreService.setDoubleClickRectId(activeObject.id);
        } else {
          this.setCanvasMarkerPopupAction(activeObject);
        }
        this.lastClickTime = currentTime;
      } else {
        this.sharedStoreService.setCanvasMarkerPopup({ visible: false, left: 0, top: 0 });
      }
    });
  }

  setCanvasMarkerPopupAction(activeObject: UIMarkerRect) {
    // left position
    const popupWidth = 80;
    let left = (activeObject.left || 0) + 5;
    if (left + popupWidth > this.canvasWidth) {
      left = this.canvasWidth - popupWidth - 5;
    }
    // popup height
    const popupHeight = 48;
    // top position calculation
    let top = (activeObject.top || 0) + (activeObject.height || 0) + 10;
    if (top + popupHeight > this.canvasHeight) {
      top = (activeObject.top || this.canvasHeight) - popupHeight - 10;
    }
    const popup: CanvasMarkerPopup = {
      visible: true,
      left: left,
      top: top
    };
    this.sharedStoreService.setCanvasMarkerPopup(popup);
  }
}
