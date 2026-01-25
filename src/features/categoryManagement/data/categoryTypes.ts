export interface CategorySettingsProps {
    firstCategoryEnabled: boolean;
    secondCategoryEnabled: boolean;
    thirdCategoryEnabled: boolean;
    fourthCategoryEnabled: boolean;
}

export type SecondCategoryProps = {
    id: string;
    categoryName: string;
    categoryOneId: string;
    image: string;
    keywords: string[];
    createdAt: Date;
    updatedAt: Date;
    positionAt: Date;
};

export type ThirdCategoryProps = {
    id: string;
    categoryName: string;
    categoryOneId: string;
    categoryTwoId: string;
    image: string;
    keywords: string[];
    createdAt: Date;
    updatedAt: Date;
    positionAt: Date;
}

export type FourthCategoryProps = {
    id: string;
    categoryName: string;
    categoryOneId: string;
    categoryTwoId: string;
    categoryThreeId: string;
    image: string;
    keywords: string[];
    createdAt: Date;
    updatedAt: Date;
    positionAt: Date;
}