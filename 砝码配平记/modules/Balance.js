export class Balance {
    constructor() {
        this.balanceBeam = document.getElementById('balance-beam');
        this.beamPointer = document.getElementById('beam-pointer');
        this.leftPan = document.getElementById('left-pan');
        this.rightPan = document.getElementById('right-pan');
        
        this.maxAngle = 30;
        this.maxWeight = 50;
    }

    update(leftWeight, rightWeight) {
        const weightDiff = rightWeight - leftWeight;
        const angle = (weightDiff / this.maxWeight) * this.maxAngle;
        const clampedAngle = Math.max(-this.maxAngle, Math.min(this.maxAngle, angle));
        
        this.balanceBeam.style.transform = `rotate(${clampedAngle}deg)`;
        
        const pointerAngle = -clampedAngle * 1.8;
        const clampedPointerAngle = Math.max(-45, Math.min(45, pointerAngle));
        this.beamPointer.style.transform = `translateX(-50%) rotate(${clampedPointerAngle}deg)`;
        
        this.updatePanVisual(leftWeight, rightWeight);
    }

    updatePanVisual(leftWeight, rightWeight) {
        if (leftWeight > rightWeight) {
            this.leftPan.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.5)';
            this.rightPan.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
        } else if (rightWeight > leftWeight) {
            this.rightPan.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.5)';
            this.leftPan.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
        } else {
            this.leftPan.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
            this.rightPan.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
        }
    }
}