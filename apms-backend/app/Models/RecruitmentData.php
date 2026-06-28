<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RecruitmentData extends Model
{
    protected $fillable = [
        'school_id',
        'academic_period_id',
        'applicants',
        'accepted',
        'enrolled',
        'walk_in',
        'online',
        'referrals',
        'notes',
    ];

    public function school()
    {
        return $this->belongsTo(School::class);
    }

    public function academicPeriod()
    {
        return $this->belongsTo(AcademicPeriod::class);
    }
}