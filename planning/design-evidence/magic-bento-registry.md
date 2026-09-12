{
"$schema": "https://ui.shadcn.com/schema/registry-item.json",
"name": "bento-grid",
"type": "registry:ui",
"title": "Bento Grid",
"description": "Bento grid is a layout used to showcase the features of a product in a simple and elegant way.",
"dependencies": [
"@radix-ui/react-icons"
],
"registryDependencies": [
"button"
],
"files": [
{
"path": "registry/magicui/bento-grid.tsx",
"content": "import { type ComponentPropsWithoutRef, type ReactNode } from \"react\"\nimport { ArrowRightIcon } from \"@radix-ui/react-icons\"\n\nimport { cn } from \"@/lib/utils\"\nimport { Button } from \"@/components/ui/button\"\n\ninterface BentoGridProps extends ComponentPropsWithoutRef<\"div\"> {\n children: ReactNode\n className?: string\n}\n\ninterface BentoCardProps extends ComponentPropsWithoutRef<\"div\"> {\n name: string\n className: string\n background: ReactNode\n Icon: React.ElementType\n description: string\n href: string\n cta: string\n}\n\nconst BentoGrid = ({ children, className, ...props }: BentoGridProps) => {\n return (\n \n {children}\n \n )\n}\n\nconst BentoCard = ({\n name,\n className,\n background,\n Icon,\n description,\n href,\n cta,\n ...props\n}: BentoCardProps) => (\n \n

{background}

\n

\n

\n \n

### \n {name}\n

\n

{description}

\n

\n\n \n \n [\n {cta}\n \n]({href}) \n \n

\n \n\n \n \n [\n {cta}\n \n]({href}) \n \n \n\n\n \n)\n\nexport { BentoCard, BentoGrid }\n",
"type": "registry:ui"
}
]
}