---
title:  "Fighting action recognition"
date:   2023-05-26 00:07:00 +0100
abstract: "
Several fighting action classifiers based on RGB-D videos were developed. The Motion History Images (MHIs) and Motion
Energy Images (MEIs) were extracted and used together with SIFT bag-of-words (BoW) features. Both shallow neural netwoks and
SVMs were outperformed by the KNN. Lastly, deep neural networks using both 2D and 3D convolution have been trained directly on
the RGB-D videos and the MHI + MEI motion silhouettes. The 3D-2D CNN significantly outperformed all classical models and the 2D
MHI + MEI CNN. The MHI + MEI silhouettes are argued to insufficiently capture the relevant information compared to “trainable deep
motion silhouettes” extracted by the 3D-2D CNN. The SIFT based BoW is argued not to be suited the partial body movement actions.
Performance-efficient CNN alternatives are proposed.
"
link: "https://drive.google.com/file/d/17xOBJ3Bk66261K-aZ9tXA67t4pXTL43z/view?usp=sharing"
---

Coursework for the [Computer Vision](https://course-module-catalog.port.ac.uk/#/moduleDetail/M24122/2022%2F23)
University of Portsmouth module.
