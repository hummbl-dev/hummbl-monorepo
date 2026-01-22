# HUMMBL Wing Components

## Quick Import

```typescript
import { Wing, WingGrid, WingSelector, WingAnimation, WingShowcase } from '@/components/wings';
```

## Usage Examples

### Single Wing
```tsx
<Wing transformation="P" size="large" animate="hover" />
```

### Wing Grid
```tsx
<WingGrid 
  transformations={["P", "IN", "CO", "DE", "RE", "SY"]} 
  columns={3} 
  animate 
/>
```

### Interactive Selector
```tsx
<WingSelector onSelect={(t) => console.log(t)} showLabels />
```

### Animation Sequence
```tsx
<WingAnimation 
  sequence={["P", "IN", "CO", "DE", "RE", "SY"]} 
  interval={1000} 
/>
```

### Complete Showcase
```tsx
<WingShowcase 
  title="HUMMBL Transformations" 
  showAllTransformations 
/>
```

## Documentation

See INTEGRATION_GUIDE.md for complete integration instructions.
